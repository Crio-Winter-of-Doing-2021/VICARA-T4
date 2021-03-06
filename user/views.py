from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
import secrets

from rest_framework.views import APIView
from rest_framework import serializers, status
from .models import Profile
from .serializers import ProfileSerializer
import re

ALLOWED_TYPES = ["FOLDER", "FILE"]
REGEX_NAME = r"^[\w\-. ]+$"
REQUIRED_POST_PARAMS = ["TYPE", "NAME", "PARENT"]
REQUIRED_PATCH_PARAMS = ["id", "NAME"]
REQUIRED_DELETE_PARAMS = ["id"]


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

    def post(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        if not all(attr in request.data for attr in REQUIRED_POST_PARAMS):
            return Response(data={"message": f"Insufficient Post params req {REQUIRED_POST_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        type = request.data["TYPE"]
        name = request.data["NAME"]
        parent = request.data["PARENT"]

        if parent not in filesystem:
            return Response(data={"message": "Invalid parent"}, status=status.HTTP_400_BAD_REQUEST)
        elif type not in ALLOWED_TYPES:
            return Response(data={"message": "Invalid type"}, status=status.HTTP_400_BAD_REQUEST)
        elif re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        elif filesystem[parent]["TYPE"] != "FOLDER":
            return Response(data={"message": "Parent is not a folder"}, status=status.HTTP_400_BAD_REQUEST)

        children = filesystem[parent]["CHILDREN"]
        for x in children:
            already_present_name = children[x]["NAME"]
            already_present_type = children[x]["TYPE"]
            if(name == already_present_name and type == already_present_type):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)

        id = secrets.token_urlsafe(16)
        children[id] = {
            "TYPE": type,
            "NAME": name
        }
        filesystem[parent]["CHILDREN"] = children
        filesystem[id] = {
            "PARENT": parent,
            "TYPE": type,
            "NAME": name
        }
        if(type == "FOLDER"):
            filesystem[id]["CHILDREN"] = {}
        profile.filesystem = filesystem
        profile.save()
        return Response(data=profile.filesystem, status=status.HTTP_201_CREATED)

    def patch(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        if not all(attr in request.data for attr in REQUIRED_PATCH_PARAMS):
            return Response(data={"message": f"Insufficient patch params req {REQUIRED_PATCH_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        id = request.data["id"]
        new_name = request.data["NAME"]

        if re.match(REGEX_NAME, new_name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        elif id not in filesystem:
            return Response(data={"message": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        elif id == "ROOT":
            return Response(data={"message": "Renaming ROOT not allowed"}, status=status.HTTP_400_BAD_REQUEST)

        parent = filesystem[id]["PARENT"]
        filesystem[parent]["CHILDREN"][id]["NAME"] = new_name
        filesystem[id]["NAME"] = new_name

        profile.filesystem = filesystem
        profile.save()
        return Response(data=profile.filesystem, status=status.HTTP_200_OK)

    def delete(self, request):

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        if not all(attr in request.data for attr in REQUIRED_DELETE_PARAMS):
            return Response(data={"message": f"Insufficient delete params req {REQUIRED_DELETE_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        id = request.data["id"]

        if id not in filesystem:
            return Response(data={"message": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)
        elif id == "ROOT":
            return Response(data={"message": "Deleting ROOT not allowed"}, status=status.HTTP_400_BAD_REQUEST)

        parent = filesystem[id]["PARENT"]
        filesystem[parent]["CHILDREN"].pop(id)
        filesystem.pop(id)

        profile.filesystem = filesystem
        profile.save()
        return Response(data=profile.filesystem, status=status.HTTP_200_OK)
