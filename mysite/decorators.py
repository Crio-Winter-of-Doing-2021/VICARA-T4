import functools
from .constants import PARENT
from user.models import Profile
from rest_framework.response import Response
from rest_framework import status
import re
from .constants import REGEX_NAME, TYPE, file, CHILDREN, NAME, FILE


def parent_present(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = request.data[PARENT]

        if parent not in filesystem:
            return Response(data={"message": "Invalid parent"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(*args, **kwargs)
        return result
    return wrapper


def check_regex(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        name = request.FILES[file].name
        if re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(*args, **kwargs)
        return result
    return wrapper


def check_id(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        file_id = request.data["file_id"]
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        if file_id not in filesystem:
            return Response(data={"message": "Invalid file id"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(*args, **kwargs)
        return result
    return wrapper


def check_already_present(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = request.data[PARENT]
        children = filesystem[parent][CHILDREN]
        name = request.FILES[file].name
        for x in children:
            already_present_name = children[x][NAME]
            already_present_type = children[x][TYPE]
            if(name == already_present_name and already_present_type == FILE):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(*args, **kwargs)
        return result
    return wrapper


def check_type(type_required):
    def decorator_check_type(func):
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs):
            parent = request.data[PARENT]
            profile = Profile.objects.get(user=request.user)
            filesystem = profile.filesystem
            if filesystem[parent][TYPE] != type_required:
                return Response(data={"message": "Parent is not a folder"}, status=status.HTTP_400_BAD_REQUEST)
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
            result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator_check_type
