import functools
import re

# django imports
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

# local imports
from user.models import Profile
from .constants import *
from file.models import PRIVACY_CHOICES, File


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
        if(request.method == "GET" or request.method == "DELETE"):
            id = request.GET["id"]
        else:
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
        if(NAME in request.data):
            name = request.data[NAME]
            if re.match(REGEX_NAME, name) is None:
                return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_equality_old_new_name(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(NAME in request.data):
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
            if(request.method == "GET" or request.method == "DELETE"):
                id = request.GET["id"]
            else:
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
            if(request.FILES or NAME in request.data):
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
                    already_present_trash = children[id][TRASH]
                    if(name == already_present_name and already_present_type == type and already_present_trash == False):
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

        if(request.method == "GET" or request.method == "DELETE"):
            id = request.GET["id"]
        else:
            id = request.data["id"]
        if id == ROOT:
            return Response(data={"message": "id can't be ROOT"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper

# share Views


def check_users_valid(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(USERS in request.data):
            usernames = request.data[USERS]
            for username in usernames:
                if not User.objects.filter(username=username).exists():
                    return Response(data={"message": f"Invalid username {username}"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_privacy_options(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(PRIVACY in request.data):
            privacy = request.data[PRIVACY]
            choices = [choice[1] for choice in PRIVACY_CHOICES]
            if(privacy not in choices):
                return Response(data={"message": f"{privacy} is invalid, should be among {choices}"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper
