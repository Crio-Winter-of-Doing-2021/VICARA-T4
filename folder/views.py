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

POST_FOLDER = ["NAME", "PARENT"]


class Filesystem(APIView):
    @check_id_folder
    @check_has_access_folder
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        folder = Folder.objects.get(id=id)
        data = FolderSerializer(folder).data
        return Response(data=data)

    @check_request_attr(POST_FOLDER)
    @check_valid_name
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_duplicate_folder_exists
    def post(self, request, * args, **kwargs):
        parent_id = request.data["PARENT"]
        name = request.data["NAME"]
        parent = Folder.objects.get(id=parent_id)
        print("in view")
        new_folder = Folder(owner=request.user, name=name, parent=parent)
        new_folder.save()

        data = FolderSerializer(new_folder).data
        return Response(data=data, status=status.HTTP_201_CREATED)
