import functools


# django imports
from rest_framework.response import Response
from rest_framework import status


# local imports

from file.models import File
from .models import Folder


def check_id_with_type(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):

        id = request.GET["id"]
        type = request.GET["TYPE"]

        if(type == "FOLDER"):
            folder = Folder.custom_objects.get_or_none(id=id)
        elif(type == "FILE"):
            file = File.custom_objects.get_or_none(id=id)

        if(folder == None and type == "FOLDER"):
            return Response(data={"message": "Invalid id | no match for folder"}, status=status.HTTP_400_BAD_REQUEST)
        if(file == None and type == "FILE"):
            return Response(data={"message": "Invalid id | no match for file "}, status=status.HTTP_400_BAD_REQUEST)
        result = func(self, request, args, **kwargs)
        return result
    return wrapper
