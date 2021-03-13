from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
import secrets
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework import serializers, status
from .models import Profile
from .serializers import ProfileSerializer
import re
from varname import nameof
from mysite.constants import *
from mysite.decorators import *

ALLOWED_TYPES = [FOLDER, FILE]
REGEX_NAME = r"^[\w\-. ]+$"
REQUIRED_POST_PARAMS = [TYPE, NAME, PARENT]
REQUIRED_PATCH_PARAMS = ["id", NAME]
REQUIRED_DELETE_PARAMS = ["id"]
REQUIRED_FAV_POST_PARAMS = ["id", "is_favourite"]
DATE_TIME_FORMAT = "%m/%d/%y %H:%M:%S"


def update_profile(profile, *args):
    for attr in args:
        setattr(profile, nameof(attr), attr)
    profile.save()


class LoginView(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        profile = Profile.objects.get(user=user)
        data = ProfileSerializer(profile).data
        return Response({'token': token.key, **data}, status=status.HTTP_201_CREATED)


class Register(APIView):
    def post(self, request):
        if User.objects.filter(username=request.data.get('username'),).exists():
            return Response({"message": "Already Present"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create(
            username=request.data.get('username'),
            email=request.data.get('username'),
        )
        user.set_password(str(request.data.get('password')))
        user.save()
        token, created = Token.objects.get_or_create(user=user)
        profile = Profile.objects.get(user=user)
        data = ProfileSerializer(profile).data
        return Response({'token': token.key, **data}, status=status.HTTP_201_CREATED)


class Logout(APIView):
    def post(self, request, format=None):
        request.user.auth_token.delete()
        return Response({"message": "logged out"}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        data = ProfileSerializer(profile).data
        return Response(data=data)

    def patch(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(
            profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)


class Filesystem(APIView):

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        return Response(data=profile.filesystem)

    @check_request_attr(REQUIRED_POST_PARAMS)
    def post(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        type = request.data[TYPE]
        name = request.data[NAME]
        parent = request.data[PARENT]

        if parent not in filesystem:
            return Response(data={"message": "Invalid parent"}, status=status.HTTP_400_BAD_REQUEST)
        elif type not in ALLOWED_TYPES:
            return Response(data={"message": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)
        elif re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        elif filesystem[parent][TYPE] != FOLDER:
            return Response(data={"message": "Parent is not a folder"}, status=status.HTTP_400_BAD_REQUEST)

        children = filesystem[parent][CHILDREN]
        for x in children:
            already_present_name = children[x][NAME]
            already_present_type = children[x][TYPE]
            if(name == already_present_name and type == already_present_type):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)

        id = secrets.token_urlsafe(16)
        children[id] = {
            TYPE: type,
            NAME: name,
            FAVOURITE: False
        }
        filesystem[parent][CHILDREN] = children
        filesystem[id] = {
            PARENT: parent,
            TYPE: type,
            NAME: name,
            FAVOURITE: False
        }
        if(type == FOLDER):
            filesystem[id][CHILDREN] = {}
        update_profile(profile, filesystem)
        return Response(data=profile.filesystem, status=status.HTTP_201_CREATED)

    @check_id_present_in_params
    @check_id_not_root
    @check_id
    def patch(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        id = request.data["id"]
        new_name = request.data[NAME]

        if re.match(REGEX_NAME, new_name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)

        parent = filesystem[id][PARENT]
        filesystem[parent][CHILDREN][id][NAME] = new_name
        filesystem[id][NAME] = new_name

        update_profile(profile, filesystem)
        return Response(data=profile.filesystem, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_DELETE_PARAMS)
    @check_id
    @check_id_not_root
    def delete(self, request):

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        recent = profile.recent

        id = request.data["id"]

        parent = filesystem[id][PARENT]
        filesystem[parent][CHILDREN].pop(id)
        filesystem.pop(id)
        if id in favourites:
            favourites.pop(id)
        if id in recent:
            recent.pop(id)
        update_profile(profile, filesystem, favourites, recent)
        return Response(data=profile.filesystem, status=status.HTTP_200_OK)


class Favourites(APIView):

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        return Response(data=profile.favourites, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_FAV_POST_PARAMS)
    @check_id
    @check_already_fav
    def post(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        id = request.data["id"]
        is_favourite = request.data["is_favourite"]
        parent = filesystem[id][PARENT]
        filesystem[id][FAVOURITE] = is_favourite
        filesystem[parent][CHILDREN][id][FAVOURITE] = is_favourite
        if(is_favourite):
            favourites[id] = filesystem[id]
        else:
            favourites.pop(id)
        update_profile(profile, filesystem, favourites)
        return Response(data=profile.filesystem, status=status.HTTP_200_OK)


def remove_oldest(recent):
    presentday = datetime.now()
    oldest_key = None
    # tommorow
    oldest_val = presentday + timedelta(1)
    # smaller the date-time-object the older it is
    for key, val in recent.items():
        timestamp_string = val[TIMESTAMP]
        datetime_object = datetime.strptime(timestamp_string, DATE_TIME_FORMAT)
        if(datetime_object < oldest_val):
            oldest_key = key
            oldest_val = datetime_object
    recent.pop(oldest_key)


class Recent(APIView):
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        return Response(data=profile.recent, status=status.HTTP_200_OK)

    @check_id_present_in_params
    @check_id
    def post(self, request):
        profile = Profile.objects.get(user=request.user)
        recent = profile.recent
        filesystem = profile.filesystem

        now = str(datetime.now().strftime(DATE_TIME_FORMAT))
        recent[id] = {
            TIMESTAMP: now,
            **filesystem[id]
        }
        if len(recent) >= 2:
            remove_oldest(recent)

        update_profile(profile, recent)
        return Response(data=profile.recent, status=status.HTTP_200_OK)
