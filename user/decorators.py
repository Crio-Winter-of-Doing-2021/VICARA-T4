from folder.serializers import FolderSerializer
import functools


# django imports
from rest_framework.response import Response
from rest_framework import status


# local imports

from file.models import File
from .models import Folder
from .utils import get_path


def check_id_with_type(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        if(request.method == "GET" or request.method == "DELETE"):
            id = request.GET["id"]
            type = request.GET["TYPE"]
        else:
            id = request.data["id"]
            type = request.data["TYPE"]
        file, folder = None, None
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


def validate_for_move(func):
    """"
    children array not of 0 len
    check proper format of request body children
    children id is correct | owner check | not trash | common parent
    if new_parent == old_parent return 400
    check new_parent path & parent_path not intersecting    
    """
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):

        new_parent = request.data.get("PARENT")
        new_parent = Folder.objects.get(id=new_parent)
        children = request.data.get("CHILDREN")
        prev_parent = None
        # validate children array
        if(len(children) == 0):
            return Response(data={"message": f'Contents to move should not be zero'}, status=status.HTTP_400_BAD_REQUEST)

        for child in children:
            # for checking proper format of the request
            if(not("type" in child and "id" in child)):
                return Response(data={"message": "invalid children array"}, status=status.HTTP_400_BAD_REQUEST)
            if(child["type"] not in ("folder", "file")):
                return Response(data={"message": f'invalid type {child["type"]}'}, status=status.HTTP_400_BAD_REQUEST)

            # for checking valid id of children
            if(type == "folder"):
                child_obj = Folder.custom_objects.get_or_none(
                    id=child["id"], owner=request.user, trash=False)
            else:
                child_obj = File.custom_objects.get_or_none(
                    id=child["id"], owner=request.user, trash=False)
            if(child_obj == None):
                return Response(data={"message": f'invalid child id or user not owner or in trash'}, status=status.HTTP_400_BAD_REQUEST)

            # for checking common parent or not
            if(prev_parent == None):
                prev_parent = child_obj.parent.id
            elif(prev_parent != child_obj.parent.id):
                return Response(data={"message": "children must be in same directory"}, status=status.HTTP_400_BAD_REQUEST)

        prev_parent = Folder.objects.get(id=prev_parent)
        if(prev_parent == new_parent):
            return Response(data={"message": "redundant request new_parent == old_parent"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper
