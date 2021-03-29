# python imports
from itertools import chain
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
from folder.models import Folder
from .serializers import ProfileSerializer, UserSerializer
from .decorators import *
from file.decorators import *
from folder.serializers import FolderSerializer
from file.serializers import FileSerializer
from folder.decorators import check_id_folder, check_id_not_root, check_is_owner_folder, check_request_attr, update_last_modified_folder
from folder.utils import set_recursive_trash

RECOVER = ["id", "TYPE"]


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
        root_folder = Folder(name="ROOT", owner=user)
        root_folder.save()
        profile.root = root_folder
        profile.save()
        data = ProfileSerializer(profile).data
        return Response({'token': token.key, **data}, status=status.HTTP_201_CREATED)


class Logout(APIView):
    def post(self, request, *args, **kwargs):
        print(request.user)
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


class ListOfUsers(APIView):

    def get(self, request):
        data = UserSerializer(User.objects.all(), many=True).data
        return Response(data=data, status=status.HTTP_200_OK)


class Favourites(APIView):

    def get(self, request):

        # folders
        folders = Folder.objects.filter(
            favourite=True, owner=request.user, trash=False)
        folders = FolderSerializer(folders, many=True).data
        for folder in folders:
            folder["type"] = "folder"
        # files
        files = File.objects.filter(
            favourite=True, owner=request.user, trash=False)
        files = FileSerializer(files, many=True).data
        for file in files:
            file["type"] = "file"

        # combined
        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class Recent(APIView):

    def get(self, request):
        # folders
        folders = Folder.objects.filter(owner=request.user, trash=False)
        folders = FolderSerializer(folders, many=True).data
        for folder in folders:
            folder["type"] = "folder"
        # files
        files = File.objects.filter(owner=request.user, trash=False)
        files = FileSerializer(files, many=True).data
        for file in files:
            file["type"] = "file"

        # combined
        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class Trash(APIView):

    def get(self, request):
        # folders
        folders = Folder.objects.filter(owner=request.user, trash=True)
        folders = FolderSerializer(folders, many=True).data
        for folder in folders:
            folder["type"] = "folder"
        # files
        files = File.objects.filter(owner=request.user, trash=True)
        files = FileSerializer(files, many=True).data
        for file in files:
            file["type"] = "file"

        # combined
        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class SharedWithMe(APIView):

    def get(self, request):
        # folders
        folders = request.user.shared_folders.all()
        folders = FolderSerializer(folders, many=True).data
        for folder in folders:
            folder["type"] = "folder"
        # files
        files = request.user.shared_files.all()
        files = FileSerializer(files, many=True).data
        for file in files:
            file["type"] = "file"

        # combined
        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class Path(APIView):

    @check_id_with_type
    def get(self, request, *args, **kwargs):
        id = request.GET["id"]
        type = request.GET["TYPE"]

        if(type == "FILE"):
            start_node = File.objects.get(id=id)
        elif(type == "FOLDER"):
            start_node = Folder.objects.get(id=id)

        if(start_node.owner != request.user):
            return Response(data={"message": "Not allowed"}, status=status.HTTP_401_UNAUTHORIZED)

        path = []
        while(start_node.parent != None):
            path.append({
                "name": start_node.name,
                "id": start_node.id
            })
            start_node = start_node.parent
        path.append({
            "name": start_node.name,
            "id": start_node.id
        })
        path.reverse()
        return Response(data=path)


class RecoverFolder(APIView):

    @check_id_folder
    @check_id_not_root
    @check_is_owner_folder
    def get(self, request, * args, **kwargs):
        # check if folder's parent is in Trash
        # if in trash move this folder to root
        # break link between them
        id = request.GET["id"]
        root_folder = request.user.profile.root
        folder = Folder.objects.get(id=id)
        parent_folder = folder.parent

        if(parent_folder.trash):
            folder.parent = root_folder
            folder.save()
        set_recursive_trash(folder, False)
        data = FolderSerializer(folder).data
        return Response(data=data, status=status.HTTP_200_OK)


class RecoverFile(APIView):

    @check_id_file
    @check_is_owner_file
    def get(self, request, * args, **kwargs):
        # check if file's parent is in Trash
        # if in trash move this file to root
        # break link between them

        id = request.GET["id"]
        root_folder = request.user.profile.root
        file = File.objects.get(id=id)
        parent_folder = file.parent
        if(parent_folder.trash):
            file.parent = root_folder
        file.trash = False
        file.save()
        data = FileSerializer(file).data
        return Response(data=data, status=status.HTTP_200_OK)
