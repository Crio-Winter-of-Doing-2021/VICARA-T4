import json
import os
import secrets
import shutil
from collections import defaultdict

import humanize
from django.contrib.auth.models import AnonymousUser, User
from django.core.files import File as DjangoCoreFile
from django.core.files import storage

from file.tasks import remove_file
# python imports
from file.utils import create_file, get_presigned_url
from mysite.settings import BASE_DIR
from rest_framework import status
# django imports
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from user.decorators import check_children
from user.serializers import ProfileSerializer, UserSerializer
from user.tasks import send_mail, sync_send_mail
from user.utils import get_client_server

from folder.tasks import remove_folder

from .decorators import *
from .models import Folder
from .serializers import (FolderSerializer, FolderSerializerMinimal,
                          FolderSerializerWithoutChildren)
from .utils import (create_folder, create_folder_rec,
                    create_folder_rec_partial, recursive_delete,
                    set_recursive_privacy, set_recursive_shared_among,
                    set_recursive_trash, propagate_size_change)

# local imports

POST_FOLDER = ["name", "PARENT"]
PATCH_FOLDER = ["id"]


def manage_reset(folder, profile):
    prev_size = folder.size
    folder.size = 0
    for child in folder.children_file.all():
        child.delete()
    for child in folder.children_folder.all():
        child.delete()
    folder.save()
    propagate_size_change(folder.parent, -prev_size)
    profile.storage_used -= prev_size
    profile.save()
    return folder, profile


class Filesystem(APIView):

    @allow_id_root
    @check_id_folder
    @check_has_access_folder
    @check_folder_not_trashed
    @update_last_modified_folder
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        folder = Folder.objects.get(id=id)
        data = FolderSerializer(folder).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_request_attr(["name", "PARENT", "REPLACE"])
    @check_valid_name
    @allow_parent_root
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_duplicate_folder_exists
    def post(self, request, * args, **kwargs):
        parent_id = request.data["PARENT"]
        name = request.data["name"]
        replace_flag = request.data["REPLACE"]
        if(not replace_flag):
            new_folder = create_folder(parent_id, request.user, name)
        else:
            parent_folder = Folder.custom_objects.get_or_none(id=parent_id)
            children = parent_folder.children_folder.all().filter(name=name)
            if(children):
                new_folder, _ = manage_reset(
                    children[0], request.user.profile)
            else:
                new_folder = create_folder(parent_id, request.user, name)

        data = FolderSerializerWithoutChildren(new_folder).data
        storage_data = ProfileSerializer(
            request.user.profile).data["storage_data"]
        return Response(data={**data, **storage_data}, status=status.HTTP_200_OK)

    @check_id_folder
    @check_has_access_folder
    @check_folder_not_trashed
    def put(self, request, * args, **kwargs):
        id = request.GET["id"]
        folder = Folder.objects.get(id=id)
        folder, profile = manage_reset(
            folder, request.user.profile)
        data = FolderSerializerWithoutChildren(folder).data
        storage_data = ProfileSerializer(profile).data["storage_data"]
        return Response(data={**data, **storage_data}, status=status.HTTP_200_OK)

    @check_request_attr(["id"])
    @check_valid_name
    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    @check_folder_not_trashed
    @check_duplicate_folder_exists
    def patch(self, request, * args, **kwargs):
        id = request.data["id"]
        folder = Folder.objects.get(id=id)

        if("trash" in request.data):
            new_trash = request.data["trash"]
            # if we are moving to trash
            if(new_trash):
                # folder was not trashed
                if(new_trash != folder.trash):
                    set_recursive_trash(folder, new_trash)
                else:
                    return Response(data={"message": "Already in Trash"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(data={"message": "Use Recovery route to recover folder"}, status=status.HTTP_400_BAD_REQUEST)

        if("privacy" in request.data):
            new_privacy = request.data["privacy"]
            if(new_privacy != folder.privacy):
                set_recursive_privacy(folder, new_privacy)

        if("favourite" in request.data):
            folder.favourite = request.data["favourite"]
            folder.save()

        if("name" in request.data):
            folder.name = request.data["name"]
            folder.save()

        if("shared_among" in request.data):

            ids = request.data["shared_among"]

            # make unique & discard owner
            ids = set(ids)
            ids.discard(folder.owner.id)
            ids = list(ids)
            # try:
            users = [User.objects.get(pk=id)
                     for id in ids]

            users_for_mail = []
            for user in users:
                if(user not in folder.shared_among.all()):
                    users_for_mail.append(user)

            users_json = UserSerializer(users_for_mail, many=True).data
            print(users_json)

            client = get_client_server(request)["client"]
            title_kwargs = {
                "sender_name": f"{request.user.first_name} {request.user.last_name} ({request.user.username})",
                "resource_name": f'a folder "{folder.name}"'
            }
            body_kwargs = {
                "resource_url": f"{client}/share/folder/{folder.id}"
            }

            sync_send_mail("SHARED_WITH_ME", users_json,
                           title_kwargs, body_kwargs)

            set_recursive_shared_among(folder, users)
            folder.present_in_shared_me_of.set(users)

        data = FolderSerializerWithoutChildren(folder).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    def delete(self, request, * args, **kwargs):
        id = get_id(request)
        folder = Folder.objects.get(id=id)
        profile = request.user.profile
        recursive_delete(folder, profile)
        profile.save()
        propagate_size_change(folder.parent, -folder.size)
        storage_data = ProfileSerializer(profile).data["storage_data"]
        return Response(data={"id": id, "storage_data": storage_data}, status=status.HTTP_200_OK)


class UploadFolder(APIView):

    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @check_request_attr(["PARENT", "PATH", "file"])
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_storage_available_folder_upload
    def post(self, request, *args, **kwargs):

        # getting data from requests
        parent_id = request.data["PARENT"]
        parent = Folder.objects.get(id=parent_id)
        paths = request.data["PATH"].read()
        paths = json.loads(paths.decode('utf-8'))
        files = request.FILES.getlist('file')
        replace_flag = request.data["REPLACE"]

        # check duplicate exists
        # take path of first file then convert to list then 2nd element is base name

        # making data required to make folders
        # max_level is for getting the len of deepest file in the folder
        max_level = -1
        structure = []
        for path_string in paths:
            path = os.path.normpath(path_string)
            # example path = ['cloudinary', 'sdflksjdf', 'sdfjsdfijsdfi','file.co']
            # for /cloudinary/sdflksjdf/sdfjsdfijsdfi/file.co
            path_list = path.split(os.sep)
            if(path_list[0] == ""):
                path_list.remove("")
            max_level = max(max_level, len(path_list))
            structure.append(path_list)
        print(f"{structure}")

        # create base folder

        base_folder_name = structure[0][0]
        children = parent.children_folder.all().filter(name=base_folder_name)
        if(children):
            if(replace_flag == False):
                return Response(data={"message": f"Folder with given name = {base_folder_name}already exists"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                base_folder, _ = manage_reset(
                    children[0], request.user.profile)
        else:
            base_folder = Folder(owner=request.user,
                                 name=base_folder_name, parent=parent)
            base_folder.save()

        # maintain parent record to make folders
        parent_record = defaultdict(dict)
        parent_record[0][base_folder_name] = base_folder.id

        # make all the folders required

        for path_list in structure:
            # because last one is the filename
            for level in range(1, len(path_list)-1):
                folder_name = path_list[level]
                parent_name = path_list[level-1]
                if(folder_name not in parent_record[level]):
                    parent_id = parent_record[level-1][parent_name]
                    new_folder = create_folder(
                        parent_id, request.user, folder_name)
                    parent_record[level][folder_name] = new_folder.id

        # make all the files
        for index, path_list in enumerate(structure):
            file_name = path_list[-1]
            file_level = len(path_list)-1
            parent_name = path_list[-2]
            parent_id = parent_record[file_level-1][parent_name]
            parent = Folder.objects.get(id=parent_id)
            req_file_size = files[index].size
            new_file = create_file(request.user, files[index],
                                   parent, file_name, req_file_size)

            request.user.profile.storage_used = request.user.profile.storage_used + \
                files[index].size
            request.user.profile.save()

        # to get updated size
        base_folder_id = base_folder.id
        base_folder = Folder.objects.get(id=base_folder_id)
        data = FolderSerializerWithoutChildren(base_folder).data
        storage_data = ProfileSerializer(
            request.user.profile).data["storage_data"]
        return Response(data={**data, **storage_data}, status=status.HTTP_201_CREATED)

    @check_request_attr(["id", "PATH", "file"])
    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    @check_folder_not_trashed
    @check_storage_available_folder_upload
    def put(self, request, *args, **kwargs):

        # getting data from requests
        paths = request.data["PATH"].read()
        paths = json.loads(paths.decode('utf-8'))
        files = request.FILES.getlist('file')

        # check duplicate exists
        # take path of first file then convert to list then 2nd element is base name

        # making data required to make folders
        # max_level is for getting the len of deepest file in the folder
        max_level = -1
        structure = []
        for path_string in paths:
            path = os.path.normpath(path_string)
            # example path = ['cloudinary', 'sdflksjdf', 'sdfjsdfijsdfi','file.co']
            # for /cloudinary/sdflksjdf/sdfjsdfijsdfi/file.co
            path_list = path.split(os.sep)
            if(path_list[0] == ""):
                path_list.remove("")
            max_level = max(max_level, len(path_list))
            structure.append(path_list)

        # create base folder

        id = request.GET["id"]
        base_folder = Folder.objects.get(id=id)
        base_folder, _ = manage_reset(
            base_folder, request.user.profile)
        base_folder_name = base_folder.name

        # maintain parent record to make folders
        parent_record = defaultdict(dict)
        parent_record[0][base_folder_name] = base_folder.id

        # make all the folders required

        for path_list in structure:
            # because last one is the filename
            for level in range(1, len(path_list)-1):
                folder_name = path_list[level]
                parent_name = path_list[level-1]
                if(folder_name not in parent_record[level]):
                    parent_id = parent_record[level-1][parent_name]
                    new_folder = create_folder(
                        parent_id, request.user, folder_name)
                    parent_record[level][folder_name] = new_folder.id

        # make all the files
        for index, path_list in enumerate(structure):
            file_name = path_list[-1]
            file_level = len(path_list)-1
            parent_name = path_list[-2]
            parent_id = parent_record[file_level-1][parent_name]
            parent = Folder.objects.get(id=parent_id)
            req_file_size = files[index].size
            create_file(request.user, files[index],
                        parent, file_name, req_file_size)
            request.user.profile.storage_used = request.user.profile.storage_used + \
                files[index].size
            request.user.profile.save()

        data = FolderSerializerWithoutChildren(base_folder).data
        storage_data = ProfileSerializer(
            request.user.profile).data["storage_data"]
        return Response(data={**data, **storage_data}, status=status.HTTP_200_OK)


class DownloadFolder(APIView):

    def make_temp_folder(self):
        transaction = secrets.token_hex(4)
        zip_dir = (BASE_DIR).joinpath(transaction)
        return zip_dir, transaction

    def convert_local_to_file_object(self, local_file_name, name_for_file_obj, owner):
        local_file = open(local_file_name, 'rb')
        djangofile = DjangoCoreFile(local_file)
        file = File(file=djangofile,
                    name=f"{name_for_file_obj}.zip",
                    owner=owner,
                    parent=None)
        file.save()
        return file

    @check_id_folder
    @check_has_access_folder
    @check_folder_not_trashed
    @update_last_modified_folder
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        folder = Folder.objects.get(id=id)
        folder_name = folder.name

        # make temp folder for download
        zip_dir, transaction = self.make_temp_folder()

        # create replica of folder locally
        new_folder = create_folder_rec(zip_dir, folder)

        # make zip of folder in temp folder
        new_folder_zipped_name = f"{folder_name}__{transaction}"

        shutil.make_archive(new_folder_zipped_name, 'zip', str(new_folder))

        # upload zip to S3
        local_file_name = f"{new_folder_zipped_name}.zip"
        file = self.convert_local_to_file_object(
            local_file_name, folder_name, request.user)
        url = get_presigned_url(file.get_s3_key())

        # remove_file.delay(new_folder_zip)
        # remove_folder.delay(str(zip_dir))

        shutil.rmtree(zip_dir)
        os.remove(f"{new_folder_zipped_name}.zip")
        return Response(data={"url": url}, status=status.HTTP_200_OK)


class FolderPicker(APIView):

    @allow_id_root
    @check_id_folder
    @check_has_access_folder
    @check_folder_not_trashed
    @update_last_modified_folder
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        folder = Folder.objects.get(id=id)
        data = FolderSerializerMinimal(folder).data
        return Response(data=data, status=status.HTTP_200_OK)


class PartialDownload(DownloadFolder):

    def get_parent(self, child):
        type, id = child["type"], child["id"]
        if(type == "folder"):
            child_obj = Folder.objects.get(id=id)
        else:
            child_obj = File.objects.get(id=id)
        return child_obj.parent

    def get_file_folder_ids(self, children):
        file_ids, folder_ids = set([]), set([])
        for child in children:
            type, id = child["type"], child["id"]
            if(type == "file"):
                file_ids.add(id)
            else:
                folder_ids.add(id)
        return file_ids, folder_ids

    @check_request_attr(["CHILDREN"])
    @check_children
    def post(self, request, * args, **kwargs):
        children = request.data.get("CHILDREN")
        file_ids, folder_ids = self.get_file_folder_ids(children)

        parent = self.get_parent(children[0])
        folder = parent
        folder_name = folder.name

        # make temp folder for download
        zip_dir, transaction = self.make_temp_folder()

        # create replica of folder locally
        new_folder = create_folder_rec_partial(
            zip_dir, folder,  file_ids, folder_ids)

        # make zip of folder in temp folder
        new_folder_zipped_name = f"{folder_name}__{transaction}"
        shutil.make_archive(new_folder_zipped_name, 'zip', str(new_folder))

        # upload zip to S3
        local_file_name = f"{new_folder_zipped_name}.zip"
        file = self.convert_local_to_file_object(
            local_file_name, folder_name, request.user)
        url = get_presigned_url(file.get_s3_key())

        # remove_file.delay(new_folder_zip)
        # remove_folder.delay(str(zip_dir))

        shutil.rmtree(zip_dir)
        os.remove(f"{new_folder_zipped_name}.zip")
        return Response(data={"url": url}, status=status.HTTP_200_OK)
