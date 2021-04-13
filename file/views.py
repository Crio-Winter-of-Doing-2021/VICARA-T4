import os

# django imports
import humanize
import requests
from django.contrib.auth.models import AnonymousUser
from django.core.files import File as DjangoCoreFile
from django.http import StreamingHttpResponse
from folder.decorators import (allow_parent_root, check_id_parent_folder,
                               check_is_owner_parent_folder,
                               check_parent_folder_not_trashed,
                               check_request_attr, check_valid_name)
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

# local imports
from user.serializers import ProfileSerializer, UserSerializer
from user.tasks import send_mail, sync_send_mail
from user.utils import get_client_server
from file.tasks import remove_file
from .decorators import *
from .serializers import FileSerializer
from .utils import create_file, get_presigned_url, get_s3_filename, rename_s3, upload_file_to_s3, delete_s3
from folder.utils import propagate_size_change
POST_FILE = ["file", "PARENT"]
PATCH_FILE = ["id"]
REQUIRED_DRIVE_POST_PARAMS = ["PARENT", "DRIVE_URL", "NAME"]


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @check_id_file
    @check_has_access_file
    @check_file_not_trashed
    @update_last_modified_file
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        file = File.objects.get(id=id)
        data = FileSerializer(file).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_request_attr(["file", "PARENT", "REPLACE"])
    # @check_valid_name_request_file
    @allow_parent_root
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_already_present(to_check="req_file_name")
    @check_storage_available_file_upload
    def post(self, request, * args, **kwargs):

        if(not request.data.get("REPLACE")):
            #  regular post request
            parent_id = request.data["PARENT"]
            parent = Folder.objects.get(id=parent_id)
            data = []
            for req_file in request.FILES.getlist('file'):
                req_file_name = req_file.name
                new_file = create_file(
                    request.user, req_file, parent, req_file_name, req_file.size)
                request.user.profile.storage_used += req_file.size
                request.user.profile.save()
                new_file = FileSerializer(new_file).data
                data.append(new_file)
            storage_data = ProfileSerializer(
                request.user.profile).data["storage_data"]
            return Response(data={"file_data": data, **storage_data}, status=status.HTTP_201_CREATED)
        else:
            parent_id = request.data["PARENT"]
            parent = Folder.objects.get(id=parent_id)
            data = []
            for req_file in request.FILES.getlist('file'):
                req_file_name = req_file.name

                # if a duplicate is found
                children = parent.children_file.all().filter(name=req_file_name)
                if(children):
                    print("old s3 key = ", children[0].get_s3_key())
                    new_file, _ = self.manage_file_fileObj_update(
                        children[0], req_file, request.user.profile)
                    print("new_file s3 key = ", new_file.get_s3_key())
                else:
                    new_file = create_file(
                        request.user, req_file, parent, req_file_name, req_file.size)
                    request.user.profile.storage_used += req_file.size
                    request.user.profile.save()
                new_file = FileSerializer(new_file).data
                data.append(new_file)
            storage_data = ProfileSerializer(
                request.user.profile).data["storage_data"]
            return Response(data={"file_data": data, **storage_data}, status=status.HTTP_201_CREATED)

    def manage_file_fileObj_update(self, file, req_file, profile):
        old_file_s3_key = file.get_s3_key()
        old_file_size = file.size

        # attaching new s3 file
        delete_s3(old_file_s3_key)

        new_key = upload_file_to_s3(req_file, old_file_s3_key)

        # making changes to file details

        # to remove media/ from the name
        file.file.name = new_key[6:]
        file.size = req_file.size
        file.shared_among.set([])
        file.present_in_shared_me_of.set([])
        file.save()

        # making changes to storage

        profile.storage_used += req_file.size - old_file_size
        profile.save()

        # making changes to parent folders
        propagate_size_change(file.parent, req_file.size - old_file_size)
        return file, profile

    @check_request_attr(["id", "file"])
    @check_id_file
    @check_is_owner_file
    @check_storage_available_file_upload
    def put(self, request, * args, **kwargs):
        # getting old details
        id = request.data["id"]
        file = File.objects.get(id=id)
        req_file = request.FILES['file']
        file, profile = self.manage_file_fileObj_update(
            file, req_file, request.user.profile)

        data = FileSerializer(file).data
        storage_data = ProfileSerializer(
            profile).data["storage_data"]
        return Response(data={"file_data": data, **storage_data}, status=status.HTTP_200_OK)

    @check_valid_name
    @check_id_file
    @check_is_owner_file
    @check_file_not_trashed
    @check_already_present(to_check="req_data_name")
    def patch(self, request, * args, **kwargs):
        id = request.data["id"]
        file = File.objects.get(id=id)

        if("trash" in request.data):
            new_trash = request.data["trash"]
            # if we are moving to trash
            if(new_trash):
                # file was not trashed
                if(new_trash != file.trash):
                    updated = True
                    file.trash = new_trash
                else:
                    return Response(data={"message": "Already in Trash"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(data={"message": "Use Recovery route to recover file"}, status=status.HTTP_400_BAD_REQUEST)

        if("name" in request.data):
            updated = True
            new_name_file_system = request.data["name"]
            """ will use this rename lines just before download"""
            # new_path = os.path.join(settings.MEDIA_ROOT, new_name)
            # initial_path = file_obj.file.path
            # os.rename(initial_path, new_path)
            old_file_key = file.get_s3_key()
            s3_new_filename = get_s3_filename(new_name_file_system)
            new_file_key = file.make_key(s3_new_filename)

            rename_s3(old_file_key, new_file_key)
            file.file.name = s3_new_filename
            file.name = new_name_file_system

        if("privacy" in request.data):
            updated = True
            file.privacy = request.data["privacy"]

        if("favourite" in request.data):
            updated = True
            file.favourite = request.data["favourite"]
        if("shared_among" in request.data):
            updated = True
            ids = request.data["shared_among"]
            # make unique & discard owner
            ids = set(ids)
            ids.discard(file.owner.id)
            ids = list(ids)
            try:
                users = [User.objects.get(pk=id)
                         for id in ids]

                users_for_mail = []
                for user in users:
                    if(user not in file.shared_among.all()):
                        users_for_mail.append(user)

                users_json = UserSerializer(users_for_mail, many=True).data

                client = get_client_server(request)["client"]
                title_kwargs = {
                    "sender_name": f"{request.user.first_name} {request.user.last_name} ({request.user.username})",
                    "resource_name": f'a file "{file.name}"'
                }
                body_kwargs = {
                    "resource_url": f"{client}/share/file/{file.id}"
                }
                sync_send_mail("SHARED_WITH_ME", users_json,
                               title_kwargs, body_kwargs)
            except Exception as e:
                print(e)
                return Response(data={"message": "invalid share id list", "exception": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            file.shared_among.set(users)
            file.present_in_shared_me_of.set(users)

        if(updated):
            file.save()
        data = FileSerializer(file).data
        return Response(data=data, status=status.HTTP_200_OK)

    def manage_file_delete(self, file):
        profile = file.owner.profile
        size = file.size
        parent = file.parent
        file.delete()
        profile.storage_used -= size
        profile.save()
        propagate_size_change(parent, -size)

    @check_id_file
    @check_is_owner_file
    def delete(self, request, * args, **kwargs):
        id = get_id(request)
        file = File.objects.get(id=id)
        self.manage_file_delete(file)
        storage_data = ProfileSerializer(
            file.owner.profile).data["storage_data"]
        return Response(data={"id": id, "storage_data": storage_data}, status=status.HTTP_200_OK)


class UploadByDriveUrl(FileView):

    def get_django_file_object(self, drive_url, name):
        # getting the django file object
        s3_name = get_s3_filename(name)
        try:
            r = requests.get(drive_url, allow_redirects=True)
        except:
            return Response(data={"message": "Invalid URL"}, status=status.HTTP_400_BAD_REQUEST)
        open(s3_name, 'wb').write(r.content)
        local_file = open(s3_name, 'rb')
        djangofile = DjangoCoreFile(local_file)
        return djangofile, s3_name

    @check_request_attr(["PARENT", "DRIVE_URL", "NAME", "REPLACE"])
    @check_valid_name
    @allow_parent_root
    @check_id_parent_folder
    # checking storage available inside the function
    @check_already_present(to_check="req_data_name")
    def post(self, request, *args, **kwargs):

        # getting request attrs
        parent = request.data["PARENT"]
        drive_url = request.data["DRIVE_URL"]
        name = request.data["NAME"]
        replace_flag = request.data["REPLACE"]

        parent_folder = Folder.objects.get(id=parent)
        children = parent_folder.children_file.all().filter(name=name)

        if(children and replace_flag):
            djangofile, _ = self.get_django_file_object(drive_url, name)
            new_file, profile = self.manage_file_fileObj_update(
                children[0], djangofile, request.user.profile)

            data = FileSerializer(new_file).data
            storage_data = ProfileSerializer(profile).data["storage_data"]
            return Response(data={"file_data": data, **storage_data}, status=status.HTTP_200_OK)

        # getting the django file object
        djangofile, s3_name = self.get_django_file_object(drive_url, name)

        # checking storage available or not
        profile = request.user.profile
        if(djangofile.size + profile.storage_used > profile.storage_avail):
            os.remove(s3_name)
            return Response(data={"message": "Insufficient space"}, status=status.HTTP_400_BAD_REQUEST)

        # making File object
        file = create_file(
            request.user, djangofile, parent_folder, name, djangofile.size)
        file.save()

        # remove temp file
        os.remove(s3_name)
        # remove_file.delay(s3_name)

        # making change to storage data
        propagate_size_change(file.parent, djangofile.size - djangofile.size)
        profile.storage_used += djangofile.size
        profile.save()

        # returing response
        data = FileSerializer(file).data
        storage_data = ProfileSerializer(
            file.owner.profile).data["storage_data"]
        return Response(data={"file_data": data, **storage_data}, status=status.HTTP_201_CREATED)

    @check_request_attr(["id", "DRIVE_URL"])
    @check_id_file
    @check_is_owner_file
    # checking storage available inside the function
    def put(self, request, * args, **kwargs):
        drive_url = request.data["DRIVE_URL"]

        # getting old details
        id = request.data["id"]
        file = File.objects.get(id=id)
        old_file_s3_key = file.get_s3_key()
        old_file_size = file.size

        djangofile, s3_name = self.get_django_file_object(drive_url, file.name)

        # checking storage available or not
        profile = request.user.profile
        if(djangofile.size - old_file_size + profile.storage_used > profile.storage_avail):
            os.remove(s3_name)
            return Response(data={"message": "Insufficient space"}, status=status.HTTP_400_BAD_REQUEST)

        # attaching new s3 file
        delete_s3(old_file_s3_key)
        new_key = upload_file_to_s3(djangofile, old_file_s3_key)

        # making changes to file details
        file.file.name = new_key
        file.size = djangofile.size
        file.shared_among.set([])
        file.present_in_shared_me_of.set([])

        # making changes to storage
        profile.storage_used += djangofile.size - old_file_size
        profile.save()

        # making changes to parent folders
        propagate_size_change(file.parent, djangofile.size - old_file_size)

        # remove temp file
        os.remove(s3_name)
        # remove_file.delay(s3_name)

        data = FileSerializer(file).data
        storage_data = ProfileSerializer(profile).data["storage_data"]
        return Response(data={"file_data": data, **storage_data}, status=status.HTTP_200_OK)


class DownloadFile(APIView):

    @check_id_file
    @check_has_access_file
    @check_file_not_trashed
    @update_last_modified_file
    def get(self, request, *args, **kwargs):
        id = request.GET["id"]
        file = File.objects.get(id=id)
        url = get_presigned_url(file.get_s3_key())
        return Response(data={"url": url}, status=status.HTTP_200_OK)
