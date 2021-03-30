from file.decorators import check_storage_available
import humanize
from collections import defaultdict
import json
import os

# django imports
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# local imports

from .decorators import *
from .serializers import FolderSerializer, FolderSerializerWithoutChildren
from .models import Folder
from .utils import set_recursive_shared_among, set_recursive_privacy, set_recursive_trash, recursive_delete, create_folder
from file.utils import create_file
POST_FOLDER = ["name", "PARENT"]
PATCH_FOLDER = ["id"]


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

    @check_request_attr(POST_FOLDER)
    @check_valid_name
    @allow_parent_root
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_duplicate_folder_exists
    def post(self, request, * args, **kwargs):
        parent_id = request.data["PARENT"]
        name = request.data["name"]
        new_folder = create_folder(parent_id, request.user, name)
        data = FolderSerializer(new_folder).data
        return Response(data=data, status=status.HTTP_201_CREATED)

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
            try:
                users = [User.objects.get(pk=id)
                         for id in ids]
            except:
                return Response(data={"message": "invalid share id list"}, status=status.HTTP_400_BAD_REQUEST)
            set_recursive_shared_among(folder, users)
            folder.present_in_shared_me_of.set(users)

        data = FolderSerializer(folder).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    def delete(self, request, * args, **kwargs):
        id = get_id(request)
        folder = Folder.objects.get(id=id)
        recursive_delete(folder)
        return Response(data={"id": id}, status=status.HTTP_200_OK)


class ShareFolder(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        creator = request.GET["CREATOR"]
        try:
            creator = User.objects.get(id=creator)
        except:
            creator = None
        if(creator == None):
            return Response(data={"message": "Invalid creator"}, status=status.HTTP_400_BAD_REQUEST)
        id = request.GET["id"]
        try:
            folder = Folder.objects.get(id=id)
        except:
            folder = None

        if(folder == None):
            return Response(data={"message": "Invalid folder id"}, status=status.HTTP_400_BAD_REQUEST)

        if(folder.owner != creator):
            return Response(data={"message": "Bad creator & id combination"}, status=status.HTTP_400_BAD_REQUEST)

        if(folder.is_root()):
            return Response(data={"message": "Can't share root folder"}, status=status.HTTP_400_BAD_REQUEST)

        visitor = request.user
        allowed = False
        if(isinstance(visitor, AnonymousUser) and folder.privacy == "PUBLIC"):
            allowed = True
        if(folder.privacy == "PUBLIC"):
            allowed = True
        if(visitor == folder.owner or visitor in folder.shared_among.all()):
            allowed = True
        if(allowed):
            data = FolderSerializer(folder).data
            return Response(data=data, status=status.HTTP_200_OK)
        else:
            return Response(data={"message": "action is UNAUTHORIZED"}, status=status.HTTP_401_UNAUTHORIZED)


class UploadFolder(APIView):

    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @check_request_attr(["PARENT", "PATH", "file"])
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_storage_available
    def post(self, request, *args, **kwargs):

        # getting data from requests
        parent_id = request.data["PARENT"]
        parent = Folder.objects.get(id=parent_id)
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
        print(f"{structure}")

        # create base folder

        base_folder_name = structure[0][0]
        children = parent.children_folder.all().filter(name=base_folder_name)
        if(children):
            return Response(data={"message": f"Folder with given name = {base_folder_name}already exists"}, status=status.HTTP_400_BAD_REQUEST)
        base_folder = Folder(owner=request.user,
                             name=base_folder_name, parent=parent)
        base_folder.save()

        # maintain parent record to make folders
        parent_record = defaultdict(dict)
        parent_record[0][base_folder_name] = base_folder.id

        # make all the folders required
        print(f"{paths=}")
        print(f"{parent_record=}")
        for path_list in structure:
            # because last one is the filename
            for level in range(1, len(path_list)-1):
                print(f"{parent_record=}")
                folder_name = path_list[level]
                parent_name = path_list[level-1]
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
            req_file_size = humanize.naturalsize(files[index].size)
            create_file(request.user, files[index],
                        parent, file_name, req_file_size)
            request.user.profile.storage_used = request.user.profile.storage_used + \
                files[index].size
            request.user.profile.save()

        data = FolderSerializerWithoutChildren(base_folder).data
        return Response(data=data, status=status.HTTP_200_OK)
