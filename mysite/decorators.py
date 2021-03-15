import functools
import re

# django imports
from rest_framework.response import Response
from rest_framework import status

# local imports
from user.models import Profile
from .constants import *


def parent_present_and_folder(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = request.data[PARENT]

        if parent not in filesystem:
            return Response(data={"message": "Invalid parent"}, status=status.HTTP_400_BAD_REQUEST)
        if filesystem[parent][TYPE] != FOLDER:
            return Response(data={"message": "parent is not a folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_id(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = request.data["id"]
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        if id not in filesystem:
            return Response(data={"message": "Invalid file id"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_file_name_from_request_file(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        name = request.FILES['file'].name
        if re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_regex_file_name_from_request_body(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        name = request.data["NAME"]
        if re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_equality_old_new_name(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        new_name = request.data["NAME"]
        id = request.data["id"]

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = filesystem[id][PARENT]
        children = filesystem[parent][CHILDREN]

        old_name = children[id][NAME]

        if(new_name == old_name):
            return Response(data={"message": "new name equals old name"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_type_id(type_required):
    def decorator_check_type(func):
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs):
            profile = Profile.objects.get(user=request.user)
            filesystem = profile.filesystem
            id = request.data["id"]
            if filesystem[id][TYPE] != type_required:
                return Response(data={"message": "id is not of a {type_required}"}, status=status.HTTP_400_BAD_REQUEST)
            result = func(self, request, *args, **kwargs)
            # Do after
            return result
        return wrapper
    return decorator_check_type


def check_request_attr(REQUIRED_PARAMS):
    def decorator_check_type(func):
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs):
            if not all(attr in request.data for attr in REQUIRED_PARAMS):
                return Response(data={"message": f"Insufficient Post params req {REQUIRED_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)
            result = func(self, request, *args, **kwargs)
            return result
        return wrapper
    return decorator_check_type


def check_already_present(to_check, type):
    def decorator_func(func):
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs):
            profile = Profile.objects.get(user=request.user)
            filesystem = profile.filesystem

            if PARENT in request.data:
                parent = request.data[PARENT]
            else:
                id = request.data["id"]
                parent = filesystem[id][PARENT]

            children = filesystem[parent][CHILDREN]

            if(to_check == "req_data_name"):
                name = request.data["NAME"]
            elif to_check == "req_file_name":
                name = request.FILES['file'].name

            for id in children:
                already_present_name = children[id][NAME]
                already_present_type = children[id][TYPE]
                if(name == already_present_name and already_present_type == type):
                    return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)
            result = func(self, request, *args, **kwargs)
            return result
        return wrapper
    return decorator_func


def check_id_present_in_params(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = request.query_params.get('id', None)
        if id == None:
            return Response(data={"message": "Url param id required"}, status=status.HTTP_400_BAD_REQUEST)
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        if id not in filesystem:
            return Response(data={"message": "Invalid file id"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_already_fav(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        id = request.data["id"]
        is_favourite = request.data["is_favourite"]
        if filesystem[id][FAVOURITE] == is_favourite:
            return Response(data={"message": "Redundant request"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_id_not_root(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = request.data["id"]
        if id == ROOT:
            return Response(data={"message": "id can't be ROOT"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper
