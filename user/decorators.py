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
            folder = Folder.objects.get(id=id)
        elif(type == "FILE"):
            file = File.objects.get(id=id)

        if(folder == None and file == None):
            return Response(data={"message": "Invalid id | no match for file ir folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper
