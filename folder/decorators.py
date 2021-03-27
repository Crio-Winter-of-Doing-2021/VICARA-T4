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

# check_is_owner
# check_is_folder
# check_request_attr
REGEX_NAME = r"^[\w\-. ]+$"


def check_id_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(request.method == "GET" or request.method == "DELETE"):
            id = request.GET["id"]
        else:
            id = request.data["id"]

        folder = Folder.objects.get(id=id)
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

        folder = Folder.objects.get(id=parent_id)
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

        folder = Folder.objects.get(id=parent_id)
        if(folder.owner != request.user):
            return Response(data={"message": "user is not owner of the parent folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_is_owner_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(request.method == "GET" or request.method == "DELETE"):
            id = request.GET["id"]
        else:
            id = request.data["id"]

        folder = Folder.objects.get(id=id)
        if(folder.owner != request.user):
            return Response(data={"message": "user is not owner of the folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_has_access_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(request.method == "GET" or request.method == "DELETE"):
            id = request.GET["id"]
        else:
            id = request.data["id"]

        folder = Folder.objects.get(id=id)
        allowed = False

        if(folder.owner == request.user or folder.privacy == False):
            allowed = True

        if (request.user in folder.shared_among):
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
            if not all(attr in request.data for attr in REQUIRED_PARAMS):
                return Response(data={"message": f"Insufficient Post params req {REQUIRED_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)
            result = func(self, request, *args, **kwargs)
            return result
        return wrapper
    return decorator_fun


def check_valid_name(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        name = request.data["NAME"]
        if re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_duplicate_folder_exists(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        name = request.data["NAME"]
        parent_id = request.data["PARENT"]
        parent_folder = Folder.objects.get(id=parent_id)
        print(f"{name=}")
        print("children", parent_folder.children_folder.all().filter(
            name=name).exists())
        children = parent_folder.children_folder.all().filter(name=name)
        if(children):
            return Response(data={"message": "Folder with given name already exists"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper