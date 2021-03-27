from folder.serializers import FolderSerializer
import secrets
from datetime import datetime

# django imports
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# local imports
from user.models import Profile
from .decorators import *

POST_FOLDER = ["name", "PARENT"]
PATCH_FOLDER = ["id"]


class Filesystem(APIView):
    @check_id_folder
    @check_has_access_folder
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        folder = Folder.objects.get(id=id)
        data = FolderSerializer(folder).data
        return Response(data=data, status=status.HTTP_200_CREATED)

    @check_request_attr(POST_FOLDER)
    @check_valid_name
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_duplicate_folder_exists
    def post(self, request, * args, **kwargs):
        parent_id = request.data["PARENT"]
        name = request.data["name"]
        parent = Folder.objects.get(id=parent_id)
        print("in view")
        new_folder = Folder(owner=request.user, name=name, parent=parent)
        new_folder.save()

        data = FolderSerializer(new_folder).data
        return Response(data=data, status=status.HTTP_201_CREATED)

    @check_valid_name
    @check_id_folder
    @check_is_owner_folder
    @check_duplicate_folder_exists
    def patch(self, request, * args, **kwargs):
        id = request.data["id"]
        folder = Folder.objects.get(id=id)

        serializer = FolderSerializer(
            folder, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_200_OK)

        return Response(data={"message": "wrong patch params"}, status=status.HTTP_200_OK)

    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    def delete(self, request, * args, **kwargs):
        id = get_id(request)
        folder = Folder.objects.get(id=id)
        folder.delete()
        return Response(data={"id": id}, status=status.HTTP_200_OK)
