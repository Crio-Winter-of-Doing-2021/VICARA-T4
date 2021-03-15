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
from .models import Profile
from .serializers import ProfileSerializer
from mysite.constants import *
from mysite.decorators import *
from .utils import update_profile, remove_oldest
from mysite.utils import recursive_delete


REQUIRED_POST_PARAMS = [NAME, PARENT]
REQUIRED_PATCH_PARAMS = ["id", NAME]
REQUIRED_DELETE_PARAMS = ["id"]
REQUIRED_FAV_POST_PARAMS = ["id", "is_favourite"]
REQUIRED_GET_PARAMS = ["id"]
REQUIRED_RECENT_GET_PARAMS = ["id"]
REQUIRED_PATH_GET_PARAMS = ["id"]


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

    @check_request_attr(REQUIRED_GET_PARAMS)
    @check_id
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        id = request.data["id"]
        return Response(data={"id": id, **filesystem[id]})

    @check_request_attr(REQUIRED_POST_PARAMS)
    @parent_present_and_folder
    @check_regex_file_name_from_request_body
    @check_already_present(to_check="req_data_name", type=FOLDER)
    def post(self, request, * args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        name = request.data[NAME]
        parent = request.data[PARENT]
        children = filesystem[parent][CHILDREN]

        id = secrets.token_urlsafe(16)
        children[id] = {
            TYPE: FOLDER,
            NAME: name,
            FAVOURITE: False
        }
        filesystem[parent][CHILDREN] = children
        filesystem[id] = {
            PARENT: parent,
            TYPE: FOLDER,
            NAME: name,
            FAVOURITE: False
        }

        filesystem[id][CHILDREN] = {}
        update_profile(profile, filesystem)
        return Response(data={"id": id, **filesystem[id]}, status=status.HTTP_201_CREATED)

    @check_request_attr(REQUIRED_PATCH_PARAMS)
    @check_id_not_root
    @check_id
    @check_regex_file_name_from_request_body
    def patch(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        id = request.data["id"]
        new_name = request.data[NAME]

        parent = filesystem[id][PARENT]
        filesystem[parent][CHILDREN][id][NAME] = new_name
        filesystem[id][NAME] = new_name

        update_profile(profile, filesystem)
        return Response(data={"id": id, **filesystem[id]}, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_DELETE_PARAMS)
    @check_id
    @check_id_not_root
    def delete(self, request):

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        recent = profile.recent

        id = request.data["id"]

        recursive_delete(id, filesystem, favourites, recent)
        update_profile(profile, filesystem, favourites, recent)
        return Response(data={"message": "Successfully deleted"}, status=status.HTTP_200_OK)


class Favourites(APIView):

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        return Response(data=profile.favourites, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_FAV_POST_PARAMS)
    @check_id
    @check_id_not_root
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
            favourites[id].pop(CHILDREN)
        else:
            favourites.pop(id)
        update_profile(profile, filesystem, favourites)
        return Response(data=profile.favourites, status=status.HTTP_200_OK)


class Recent(APIView):

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        return Response(data=profile.recent, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_RECENT_GET_PARAMS)
    @check_id
    @check_id_not_root
    def post(self, request):
        id = request.data["id"]
        profile = Profile.objects.get(user=request.user)
        recent = profile.recent
        filesystem = profile.filesystem

        now = str(datetime.now().strftime(DATE_TIME_FORMAT))
        recent[id] = {
            TIMESTAMP: now,
            NAME: filesystem[id][NAME],
            TYPE: filesystem[id][TYPE],
        }
        if len(recent) >= 10:
            remove_oldest(recent)

        update_profile(profile, recent)
        return Response(data=profile.recent, status=status.HTTP_200_OK)


class Path(APIView):

    @check_request_attr(REQUIRED_PATH_GET_PARAMS)
    @check_id
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        id = request.data["id"]
        path = []
        while(filesystem[id][PARENT] != None):
            name = filesystem[id][NAME]
            path.append({NAME: name, "id": id})
            id = filesystem[id][PARENT]
        path.append({NAME: ROOT, "id": ROOT})
        path.reverse()
        return Response(data=path)
