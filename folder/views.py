
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
import secrets
from datetime import datetime

# django imports
from django.contrib.auth.models import User
from django.db import models
from django.shortcuts import render
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# local imports
from user.models import Profile
from .decorators import *
from folder.serializers import FolderSerializer
from .models import Folder
from .utils import set_recursive_shared_among, set_recursive_privacy, set_recursive_trash, recursive_delete
POST_FOLDER = ["name", "PARENT"]
PATCH_FOLDER = ["id"]


class Filesystem(APIView):

    @allow_id_root
    @check_id_folder
    @check_has_access_folder
    @update_last_modified_folder
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        folder = Folder.objects.get(id=id)
        data = FolderSerializer(folder).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_request_attr(POST_FOLDER)
    @check_valid_name
    @allow_parent_root
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_duplicate_folder_exists
    def post(self, request, * args, **kwargs):
        parent_id = request.data["PARENT"]
        name = request.data["name"]
        parent = Folder.objects.get(id=parent_id)
        new_folder = Folder(owner=request.user, name=name, parent=parent)
        new_folder.save()

        data = FolderSerializer(new_folder).data
        return Response(data=data, status=status.HTTP_201_CREATED)

    @check_valid_name
    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    @check_folder_not_trashed
    @check_duplicate_folder_exists
    def patch(self, request, * args, **kwargs):
        id = request.data["id"]
        folder = Folder.objects.get(id=id)

        if("trash" in request.data):
            new_trash = request.data["trash"]
            # if we are moving to trash
            if(new_trash):
                # folder was not trashed
                if(new_trash != folder.trash):
                    set_recursive_trash(folder, new_trash)
                else:
                    return Response(data={"message": "Already in Trash"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(data={"message": "Use Recovery route to recover folder"}, status=status.HTTP_400_BAD_REQUEST)

        if("privacy" in request.data):
            new_privacy = request.data["privacy"]
            if(new_privacy != folder.privacy):
                set_recursive_privacy(folder, new_privacy)

        if("favourite" in request.data):
            folder.favourite = request.data["favourite"]
            folder.save()
        if("shared_among" in request.data):

            ids = request.data["shared_among"]

            # make unique & discard owner
            ids = set(ids)
            ids.discard(folder.owner.id)
            ids = list(ids)

            users = [User.objects.get(pk=id)
                     for id in ids]
            set_recursive_shared_among(folder, users)

        data = FolderSerializer(folder).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    def delete(self, request, * args, **kwargs):
        id = get_id(request)
        folder = Folder.objects.get(id=id)
        recursive_delete(folder)
        return Response(data={"id": id}, status=status.HTTP_200_OK)


class ShareFolder(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        creator = request.GET["CREATOR"]
        try:
            creator = User.objects.get(id=creator)
        except:
            creator = None
        if(creator == None):
            return Response(data={"message": "Invalid creator"}, status=status.HTTP_400_BAD_REQUEST)
        id = request.GET["id"]
        try:
            folder = Folder.objects.get(id=id)
        except:
            folder = None

        if(folder == None):
            return Response(data={"message": "Invalid folder id"}, status=status.HTTP_400_BAD_REQUEST)

        if(folder.owner != creator):
            return Response(data={"message": "Bad creator & id combination"}, status=status.HTTP_400_BAD_REQUEST)

        if(folder.is_root()):
            return Response(data={"message": "Can't share root folder"}, status=status.HTTP_400_BAD_REQUEST)

        visitor = request.user
        allowed = False
        if(isinstance(visitor, AnonymousUser) and folder.privacy == "PUBLIC"):
            allowed = True
        if(folder.privacy == "PUBLIC"):
            allowed = True
        if(visitor == folder.owner or visitor in folder.shared_among.all()):
            allowed = True
        if(allowed):
            data = FolderSerializer(folder).data
            return Response(data=data, status=status.HTTP_200_OK)
        else:
            return Response(data={"message": "action is UNAUTHORIZED"}, status=status.HTTP_401_UNAUTHORIZED)
