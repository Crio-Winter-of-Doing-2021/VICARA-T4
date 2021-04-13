from folder.serializers import FolderSerializer
import functools


# django imports
from rest_framework.response import Response
from rest_framework import status


# local imports

from file.models import File
from .models import Folder
from .utils import get_path, present_in_subdirectory


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


def get_child_object(child):
    type, id = child["type"], child["id"]
    if(type == "folder"):
        child_obj = Folder.custom_objects.get_or_none(id=id)
    else:
        child_obj = File.custom_objects.get_or_none(id=id)
    return child_obj


def check_new_parent_not_in_sub_directory(func):

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        children = request.data.get("CHILDREN")
        new_parent = request.data.get("PARENT")
        new_parent = Folder.objects.get(id=new_parent)
        new_parent_path = get_path(new_parent)

        for child in children:
            child_obj = get_child_object(child)
            child_obj_path = get_path(child_obj)
            if(present_in_subdirectory(new_parent_path, child_obj_path)):
                return Response(data={"message": "Can not move folder to its own sub-directory"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_children(func):
    """"
    children array not of 0 len
    check proper format of request body children
    check already present in new_parent or not
    children id is correct | owner check | not trash | common parent
    """
    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):
        prev_parent = None
        children = request.data.get("CHILDREN")
        new_parent = request.data.get("PARENT")
        new_parent = Folder.objects.get(id=new_parent)
        new_parent_children_folder = new_parent.children_folder.all()
        new_parent_children_file = new_parent.children_file.all()

        # validate children array

        if(len(children) == 0):
            return Response(data={"message": f'Contents to move should not be zero'}, status=status.HTTP_400_BAD_REQUEST)

        for child in children:
            # for checking proper format of the request
            if(not("type" in child and "id" in child)):
                return Response(data={"message": f"invalid child {child}children array"}, status=status.HTTP_400_BAD_REQUEST)
            if(child["type"] not in ("folder", "file")):
                return Response(data={"message": f'invalid type {child["type"]}'}, status=status.HTTP_400_BAD_REQUEST)

            # for checking valid id of children
            child_obj = get_child_object(child)
            if(child_obj == None):
                return Response(data={"message": f'invalid child id = {id} or user not owner or in trash'}, status=status.HTTP_400_BAD_REQUEST)

            # for checking common parent or not
            if(prev_parent == None):
                prev_parent = child_obj.parent.id
            elif(prev_parent != child_obj.parent.id):
                return Response(data={"message": "children must be in same directory {child_obj}"}, status=status.HTTP_400_BAD_REQUEST)

        for child in children:
            child_obj = get_child_object(child)
            if(child["type"] == "folder"):
                matches = new_parent_children_folder.filter(
                    name=child_obj.name)
            else:
                matches = new_parent_children_file.filter(
                    name=child_obj.name)
            if(matches):
                return Response(data={"message": f"A {child['type']} with name '{child_obj.name}' Already exists in destination folder"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper


def check_prev_parent_old_parent_different(func):

    def get_parent(child):
        type, id = child["type"], child["id"]
        if(type == "folder"):
            child_obj = Folder.objects.get(id=id)
        else:
            child_obj = File.objects.get(id=id)
        return child_obj.parent

    @functools.wraps(func)
    def wrapper(self, request, *args, **kwargs):

        new_parent = request.data.get("PARENT")
        new_parent = Folder.objects.get(id=new_parent)
        children = request.data.get("CHILDREN")
        prev_parent = get_parent(children[0])
        if(prev_parent == new_parent):
            return Response(data={"message": "redundant request new_parent == old_parent"}, status=status.HTTP_400_BAD_REQUEST)

        result = func(self, request, args, **kwargs)
        return result
    return wrapper
