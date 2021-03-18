from django.contrib.auth.models import Permission
from file.serializers import FileSerializer
from varname import nameof
import secrets
import os
# django imports
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.auth.models import AnonymousUser
# local imports
from user.models import Profile
from .models import File
from mysite.constants import *
from mysite.decorators import *
from mysite.utils import delete_by_id

REQUIRED_POST_PARAMS = [PARENT, "file"]
REQUIRED_PATCH_PARAMS = ["id"]
REQUIRED_DELETE_PARAMS = ["id"]
REGEX_NAME = r"^[\w\-. ]+$"


def update_profile(profile, *args):
    for attr in args:
        setattr(profile, nameof(attr), attr)
    profile.save()


def update_property(id, filesystem, recent, favourites, PROPERTY, new_value):
    parent = filesystem[id][PARENT]
    children = filesystem[parent][CHILDREN]
    children[id][PROPERTY] = new_value
    filesystem[parent][CHILDREN] = children
    filesystem[id][PROPERTY] = new_value
    if(id in recent):
        recent[id][PROPERTY] = new_value
    if(id in favourites):
        favourites[id][PROPERTY] = new_value


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @check_id
    @check_type_id(type_required=FILE)
    def get(self, request):
        id = request.GET["id"]
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        file_obj = File.objects.get(filesystem_id=id)
        fileData = FileSerializer(file_obj).data
        return Response(data={**fileData, **filesystem[id]}, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_POST_PARAMS)
    @parent_present_and_folder
    @check_file_name_from_request_file
    @check_already_present(to_check="req_file_name", type=FILE)
    def post(self, request, *args, **kwargs):

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = request.data[PARENT]
        name = request.FILES['file'].name
        children = filesystem[parent][CHILDREN]
        filesystem_id = secrets.token_urlsafe(16)
        file_obj = File(
            file=request.FILES['file'], filesystem_id=filesystem_id, creator=request.user)
        file_obj.save()
        children[filesystem_id] = {
            TYPE: FILE,
            NAME: name,
            FAVOURITE: False,
            PRIVACY: PRIVATE
        }
        filesystem[parent][CHILDREN] = children
        filesystem[filesystem_id] = {
            PARENT: parent,
            TYPE: FILE,
            NAME: name,
            FAVOURITE: False,
            PRIVACY: PRIVATE
        }
        update_profile(profile, filesystem)
        fileData = FileSerializer(file_obj).data
        # print(fileData)
        return Response(data={**fileData, **filesystem[filesystem_id]}, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_DELETE_PARAMS)
    @check_id
    @check_type_id(type_required=FILE)
    def delete(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        recent = profile.recent
        id = request.data["id"]
        delete_by_id(id, filesystem, favourites, recent)
        update_profile(profile, filesystem, favourites, recent)
        return Response(data={"message": "Successfully deleted"}, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_PATCH_PARAMS)
    @check_id
    @check_type_id(type_required=FILE)
    @check_regex_file_name_from_request_body
    @check_equality_old_new_name
    @check_already_present(to_check="req_data_name", type=FILE)
    @check_privacy_options
    @check_users_valid
    def patch(self, request, *args, **kwargs):

        id = request.data["id"]
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        recent = profile.recent
        favourites = profile.favourites
        file_obj = File.objects.get(filesystem_id=id)

        if(NAME in request.data):
            new_name = request.data[NAME]
            file_obj.file.name = new_name
            update_property(id, filesystem, recent, favourites, NAME, new_name)

        if(PRIVACY in request.data):
            new_privacy = request.data[PRIVACY]
            file_obj.privacy = new_privacy
            update_property(id, filesystem, recent,
                            favourites, PRIVACY, new_privacy)

        if(USERS in request.data):
            usernames = request.data[USERS]
            users = [User.objects.get(username=username)
                     for username in usernames]
            file_obj.users.set(users)

        file_obj.save()
        update_profile(profile, filesystem, recent, favourites)
        fileData = FileSerializer(file_obj).data
        return Response(data={**fileData, **filesystem[id]}, status=status.HTTP_200_OK)


class Share(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        creator = request.GET[CREATOR]
        try:
            creator = User.objects.get(username=creator)
        except:
            creator = None
        if(creator == None):
            return Response(data={"message": "Invalid creator"}, status=status.HTTP_400_BAD_REQUEST)
        id = request.GET["id"]
        try:
            file_obj = File.objects.get(filesystem_id=id)
        except:
            file_obj = None

        if(file_obj == None):
            return Response(data={"message": "Invalid file id"}, status=status.HTTP_400_BAD_REQUEST)

        if(file_obj.creator != creator):
            return Response(data={"message": "Bad creator & id combination"}, status=status.HTTP_400_BAD_REQUEST)

        profile = Profile.objects.get(user=creator)
        filesystem = profile.filesystem

        if(filesystem[id][TYPE] != FILE):
            return Response(data={"message": "id is not of a file"}, status=status.HTTP_400_BAD_REQUEST)

        visitor = request.user
        allowed = False
        if(isinstance(visitor, AnonymousUser) and file_obj.privacy == PUBLIC):
            allowed = True

        if(visitor == file_obj.creator or visitor in file_obj.users.all()):
            allowed = True
        if(allowed):
            fileData = FileSerializer(file_obj).data
            return Response(data=fileData, status=status.HTTP_200_OK)
        else:
            return Response(data={"message": "action is UNAUTHORIZED"}, status=status.HTTP_401_UNAUTHORIZED)
