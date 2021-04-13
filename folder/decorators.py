from datetime import datetime
import functools
import re

# django imports
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

# local imports
from user.models import Profile
from file.models import File
from folder.models import Folder
from folder.serializers import FolderSerializerWithoutChildren

# check_is_owner
# check_is_folder
# check_request_attr
REGEX_NAME = r"^[\w\-. ]+$"


def get_id(request):
    if(request.method == "GET" or request.method == "DELETE"):
        id = request.GET["id"]
    else:
        id = request.data["id"]
    return id


def allow_id_root_helper(request):
    id = get_id(request)
    if(id == "ROOT"):
        if(request.method == "GET" or request.method == "DELETE"):
            request.GET._mutable = True
            request.GET["id"] = request.user.profile.root.id
            request.GET._mutable = False
        else:
            request.POST._mutable = True
            request.data["id"] = request.user.profile.root.id
            request.POST._mutable = False
    return request


def allow_id_root(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):

        id = get_id(request)
        if(id == "ROOT"):
            request = allow_id_root_helper(request)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def allow_parent_root(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        parent = request.data["PARENT"]
        if(parent == "ROOT"):
            if(request.method == "GET" or request.method == "DELETE"):
                request.GET._mutable = True
                request.GET["PARENT"] = request.user.profile.root.id
                request.GET._mutable = False
            else:
                request.POST._mutable = True
                request.data["PARENT"] = request.user.profile.root.id
                request.POST._mutable = False

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_id_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)
        folder = Folder.custom_objects.get_or_none(id=id)
        if(folder == None):
            return Response(data={"message": "Invalid id or id is not of a folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_id_parent_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(request.method == "GET" or request.method == "DELETE"):
            parent_id = request.GET["PARENT"]
        else:
            parent_id = request.data["PARENT"]

        folder = Folder.custom_objects.get_or_none(id=parent_id)
        if(folder == None):
            return Response(data={"message": "Invalid parent id or parent id is not of a folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_is_owner_parent_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(request.method == "GET" or request.method == "DELETE"):
            parent_id = request.GET["PARENT"]
        else:
            parent_id = request.data["PARENT"]

        folder = Folder.custom_objects.get_or_none(id=parent_id)
        if(folder.owner != request.user):
            return Response(data={"message": "user is not owner of the parent folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_is_owner_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)

        folder = Folder.custom_objects.get_or_none(id=id)
        if(folder.owner != request.user):
            return Response(data={"message": "user is not owner of the folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_has_access_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)

        folder = Folder.custom_objects.get_or_none(id=id)
        allowed = False

        if(folder.owner == request.user or folder.privacy == False):
            allowed = True

        if (request.user in folder.shared_among.all()):
            allowed = True

        if(not allowed):
            return Response(data={"message": "user is not allowed to see the folder"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_request_attr(REQUIRED_PARAMS):
    def decorator_fun(func):
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs):
            if(request.method == "GET" or request.method == "DELETE"):
                request_data = request.GET
            else:
                request_data = request.data

            for attr in REQUIRED_PARAMS:
                if(attr not in request_data):
                    return Response(data={"message": f"{attr} is missing"}, status=status.HTTP_400_BAD_REQUEST)
                if(isinstance(attr, str) and request_data[attr] == ""):
                    return Response(data={"message": f"{attr} is can't be blank"}, status=status.HTTP_400_BAD_REQUEST)
            result = func(self, request, *args, **kwargs)
            return result
        return wrapper
    return decorator_fun


def check_valid_name(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        # in patch there might be cases when name is not changed
        if("name" in request.data):
            name = request.data["name"]
            if re.match(REGEX_NAME, name) is None:
                return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_valid_name(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        # in patch there might be cases when name is not changed
        if("name" in request.data):
            name = request.data["name"]
            # if re.match(REGEX_NAME, name) is None:
            #     return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
            if(name == ""):
                return Response(data={"message": "Name can't be blank"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_duplicate_folder_exists(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):

        # We are using form-data in frontend which can't send Boolean
        if(request.data.get("REPLACE") == "true"):
            result = func(self, request, *args, **kwargs)
            return result

        # there might be cases in patch when we are not changing names
        if("name" in request.data):
            name = request.data["name"]
            # for post when new is created by parent id
            if("PARENT" in request.data):
                parent_id = request.data["PARENT"]
                parent_folder = Folder.custom_objects.get_or_none(id=parent_id)
            # for patch when rename is done by folder id
            else:
                id = get_id(request)
                folder = Folder.custom_objects.get_or_none(id=id)
                parent_folder = folder.parent

            children = parent_folder.children_folder.all().filter(name=name)
            if(children):

                # this is the case in which the folder is renamed as its prev name
                if(request.method == "PATCH"):
                    if(children[0]["id"] == id):
                        folder = children[0]
                        data = FolderSerializerWithoutChildren(folder).data
                        return Response(data=data, status=status.HTTP_200_OK)

                res = {
                    "message": "Duplicate folder exists",
                    "error_code": "DUPLICATE_FOLDER",
                    "data": [
                        {
                            "id": children[0].id,
                            "name": children[0].name
                        }
                    ]
                }
                return Response(data=res, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_id_not_root(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)

        folder = Folder.custom_objects.get_or_none(id=id)
        if(folder.parent == None):
            return Response(data={"message": "Can't perform this action with Root folder"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_parent_folder_not_trashed(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = request.data["PARENT"]
        folder = Folder.custom_objects.get_or_none(id=id)

        if folder.trash:
            return Response(data={"message": "Folder is in Trash. Please restore to view it."}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_folder_not_trashed(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)
        folder = Folder.custom_objects.get_or_none(id=id)

        if folder.trash:
            return Response(data={"message": "Folder is in Trash. Please restore to view it."}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def update_last_modified_folder(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)
        folder = Folder.custom_objects.get_or_none(id=id)
        folder.last_modified = datetime.now()
        folder.save()
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_storage_available_folder_upload(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        profile = request.user.profile
        if(request.method == "POST"):
            space_required = 0
            for req_file in request.FILES.getlist('file'):
                space_required += req_file.size
        elif(request.method == "PUT"):
            id = get_id(request)
            old_folder = Folder.custom_objects.get_or_none(id=id)
            space_required = 0
            for req_file in request.FILES.getlist('file'):
                space_required += req_file.size
            space_required -= old_folder.size

        if(space_required + profile.storage_used > profile.storage_avail):
            return Response(data={"message": "Insufficient space"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper
