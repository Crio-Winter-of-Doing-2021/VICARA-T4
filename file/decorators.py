from file.serializers import FileSerializer
import functools
import re
from datetime import datetime
# django imports
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

# local imports
from .models import File
from folder.models import Folder


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


def check_id_file(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)
        file = File.custom_objects.get_or_none(id=id)
        if(file == None):
            return Response(data={"message": "Invalid id or id is not of a file"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_is_owner_file(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)

        file = File.custom_objects.get_or_none(id=id)
        if(file.owner != request.user):
            return Response(data={"message": "user is not owner of the file"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_has_access_file(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)

        file = File.custom_objects.get_or_none(id=id)
        allowed = False

        if(file.owner == request.user or file.privacy == False):
            allowed = True

        if (request.user in file.shared_among.all()):
            allowed = True

        if(not allowed):
            return Response(data={"message": "user is not allowed to see the file"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_valid_name_request_file(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        for req_file in request.FILES.getlist('file'):
            name = req_file.name
            if re.match(REGEX_NAME, name) is None:
                return Response(data={"message": f"Invalid Name of file - {name}"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_valid_name_request_body(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        name = request.data["NAME"]
        if re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name of file"}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def manage_duplicate(name, parent_folder, duplicate_res):

    children = parent_folder.children_file.all().filter(name=name)
    if(children):
        duplicate_res["data"].append({
            "id": children[0].id,
            "name": children[0].name,
        })


def check_already_present(to_check):
    def decorator_func(func):
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs):

            # We are using form-data in frontend which can't send Boolean
            if(request.data.get("REPLACE") == "true"):
                result = func(self, request, *args, **kwargs)
                return result

            # there might be cases in patch when we are not changing names
            if(request.FILES or "name" in request.data):

                # for post when new is created by parent id
                if("PARENT" in request.data):
                    parent_id = request.data["PARENT"]
                    parent_folder = Folder.custom_objects.get_or_none(
                        id=parent_id)

                # for patch when rename is done by folder id
                else:
                    id = get_id(request)
                    folder = File.custom_objects.get_or_none(id=id)
                    parent_folder = folder.parent

                duplicate_res = {
                    "message": "Duplicate file exists",
                    "error_code": "DUPLICATE_FILE",
                    "data": []
                }

                if(to_check == "req_data_name"):
                    name = request.data["name"]
                    manage_duplicate(name, parent_folder, duplicate_res)

                elif to_check == "req_file_name":
                    for req_file in request.FILES.getlist('file'):
                        name = req_file.name
                        manage_duplicate(name, parent_folder, duplicate_res)

                if(len(duplicate_res["data"]) > 0):
                    # this is the case in which the file is renamed as its prev name
                    if(request.method == "PATCH"):
                        if(duplicate_res["data"][0]["id"] == id):
                            file = File.objects.get(id=id)
                            data = FileSerializer(file).data
                            return Response(data=data, status=status.HTTP_200_OK)

                    return Response(data=duplicate_res, status=status.HTTP_400_BAD_REQUEST)

            result = func(self, request, *args, **kwargs)
            return result
        return wrapper
    return decorator_func


def check_file_not_trashed(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)
        file = File.custom_objects.get_or_none(id=id)

        if file.trash:
            return Response(data={"message": "File is in Trash. Please restore to view it."}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def update_last_modified_file(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        id = get_id(request)
        file = File.custom_objects.get_or_none(id=id)
        file.last_modified = datetime.now()
        file.save()
        result = func(self, request, *args, **kwargs)
        return result
    return wrapper


def check_storage_available_file_upload(func):
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        profile = request.user.profile
        if(request.method == "POST"):
            space_required = 0
            for req_file in request.FILES.getlist('file'):
                space_required += req_file.size
        elif(request.method == "PUT"):
            id = get_id(request)
            no_of_req_files = len(request.FILES.getlist('file'))
            if(no_of_req_files == 1):
                old_file = File.custom_objects.get_or_none(id=id)
                old_file_size = old_file.size
                req_file = request.FILES['file']
                new_file_size = req_file.size
                space_required = new_file_size - old_file_size
            else:
                pass
        if(space_required + profile.storage_used > profile.storage_avail):
            return Response(data={"message": "Insufficient space"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, *args, **kwargs)
        return result
    return wrapper
