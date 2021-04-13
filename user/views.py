
import json
import secrets
from itertools import chain

from cloudinary.uploader import upload
# django imports
from django.contrib.auth.models import User, update_last_login
from django.db.models import CharField, Q, Value
from django.db.models.functions import Concat
from django.shortcuts import render
from drf_social_oauth2.views import ConvertTokenView
from file.decorators import *
from file.serializers import FileSerializer
from folder.decorators import (allow_id_root_helper, check_id_folder,
                               check_id_not_root, check_id_parent_folder,
                               check_is_owner_folder,
                               check_is_owner_parent_folder,
                               check_parent_folder_not_trashed,
                               check_request_attr, update_last_modified_folder)
from folder.models import Folder
from folder.serializers import (FolderSerializer,
                                FolderSerializerWithoutChildren)
from folder.utils import propagate_size_change, set_recursive_trash
from oauth2_provider.models import AccessToken
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .decorators import *
# local imports
from .models import Profile
from .serializers import ProfileSerializer, UserSerializer
from .utils import get_path, is_valid_email

RECOVER = ["id", "TYPE"]


class CustomConvertTokenView(ConvertTokenView):
    def post(self, request, *args, **kwargs):
        # Use the rest framework `.data` to fake the post body of the django request.
        mutable_data = request.data.copy()
        request._request.POST = request._request.POST.copy()
        for key, value in mutable_data.items():
            request._request.POST[key] = value

        url, headers, body, status = self.create_token_response(
            request._request)

        regular_response = json.loads(body)
        access_token = regular_response["access_token"]
        user = AccessToken.objects.get(token=access_token).user
        profile_data = ProfileSerializer(user.profile).data
        print(f"{profile_data}")
        response = Response(
            data={**regular_response, **profile_data}, status=status)

        for k, v in headers.items():
            response[k] = v
        return response


class ProfileView(APIView):
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        data = ProfileSerializer(profile).data
        return Response(data=data)

    def patch(self, request):
        profile = Profile.custom_objects.get_or_none(user=request.user)
        if(profile == None):
            return Response(data={"message": "Invalid id"}, status=status.HTTP_400_BAD_REQUEST)

        if(not(profile.user == request.user or request.user.is_staff)):
            return Response(data={"message": "Not allowed"}, status=status.HTTP_401_UNAUTHORIZED)
        updated = False
        if("email" in request.data):
            new_email = request.data["email"]
            user_with_given_mail = Profile.custom_objects.get_or_none(
                user__email=new_email)
            if(user_with_given_mail != None and user_with_given_mail != request.user):
                return Response(data={"message": "Another User with given mail already exists"}, status=status.HTTP_400_BAD_REQUEST)
            if(is_valid_email(new_email)):
                updated = True
                profile.user.email = new_email
            else:
                return Response(data={"message": "Invalid email"}, status=status.HTTP_400_BAD_REQUEST)

        if("gender" in request.data):
            new_gender = request.data["gender"]
            if(new_gender in [1, 2, 3, 4]):
                updated = True
                profile.gender = new_gender
            else:
                return Response(data={"message": "Invalid gender"}, status=status.HTTP_400_BAD_REQUEST)

        if("capacity" in request.data):
            if(not request.user.is_staff):
                return Response(data={"message": "Admin Rights required"}, status=status.HTTP_401_UNAUTHORIZED)

            updated = True
            new_capacity = request.data["capacity"]
            profile.capacity = new_capacity

        if(updated):
            profile.user.save()
            profile.save()

        data = ProfileSerializer(profile).data
        return Response(data=data, status=status.HTTP_200_OK)


class ProfilePicture(APIView):
    parser_classes = (
        MultiPartParser,
        JSONParser,
    )

    def post(self, request, format=None):
        try:
            file = request.FILES.get('picture')
            user_profile = Profile.objects.get(user=request.user)
            cloudinary_response = upload(
                file, width=450, height=450, crop="thumb", gravity="faces", zoom=0.65, radius="max")
            user_profile.profile_picture_url = cloudinary_response["secure_url"]
            user_profile.save()
            data = ProfileSerializer(user_profile).data
            return Response(data=data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(str(e))
            return Response(data=str(e), status=status.HTTP_400_BAD_REQUEST)


class ListOfUsers(APIView):

    def get(self, request):
        data = UserSerializer(User.objects.all(), many=True).data
        return Response(data=data, status=status.HTTP_200_OK)


class SearchUsers(APIView):

    @check_request_attr(["query"])
    def get(self, request):
        query = request.GET["query"].lower()
        qs = User.objects.all()
        qs = qs.annotate(
            full_name=Concat(
                'first_name',
                Value(' '),
                'last_name',
                output_field=CharField()
            )
        ).filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(full_name__icontains=query)).exclude(id=request.user.id)
        data = UserSerializer(qs, many=True).data

        return Response(data=data, status=status.HTTP_200_OK)


class SearchFileFolder(APIView):

    @check_request_attr(["query"])
    def get(self, request):
        query = request.GET["query"].lower()
        files = File.objects.filter(
            owner=request.user, trash=False, name__icontains=query)
        files = FileSerializer(files, many=True).data

        folders = Folder.objects.filter(
            owner=request.user, trash=False, name__icontains=query)
        folders = FolderSerializerWithoutChildren(folders, many=True).data

        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class Favourites(APIView):

    def get(self, request):

        # folders
        folders = Folder.objects.filter(
            favourite=True, owner=request.user, trash=False)
        folders = FolderSerializerWithoutChildren(folders, many=True).data

        # files
        files = File.objects.filter(
            favourite=True, owner=request.user, trash=False)
        files = FileSerializer(files, many=True).data

        # combined
        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class Recent(APIView):

    def get(self, request):
        # folders
        folders = Folder.objects.filter(
            owner=request.user, trash=False).exclude(id=request.user.profile.root.id)
        folders = FolderSerializerWithoutChildren(folders, many=True).data

        # files
        files = File.objects.filter(owner=request.user, trash=False)
        files = FileSerializer(files, many=True).data

        # combined
        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class Trash(APIView):

    def parent_trashed(self, obj):
        copy_obj = obj
        while(copy_obj.parent != None):
            if(copy_obj.parent.trash):
                return False
            else:
                copy_obj = copy_obj.parent
        return True

    def get(self, request):
        # folders
        folders = Folder.objects.filter(owner=request.user, trash=True)
        folders = filter(self.parent_trashed, folders)
        folders = FolderSerializerWithoutChildren(folders, many=True).data

        # files
        files = File.objects.filter(owner=request.user, trash=True)
        files = filter(self.parent_trashed, files)
        files = FileSerializer(files, many=True).data

        # combined
        result_list = list(chain(folders, files))
        return Response(data=result_list, status=status.HTTP_200_OK)


class SharedWithMe(APIView):

    def get(self, request):
        # folders
        folders = request.user.shared_with_me_folders.all()
        folders = FolderSerializerWithoutChildren(folders, many=True).data

        # files
        files = request.user.shared_with_me_files.all()
        files = FileSerializer(files, many=True).data

        # combined
        result_list = list(chain(folders, files))

        return Response(data=result_list, status=status.HTTP_200_OK)


class Path(APIView):
    @check_request_attr(["id", "TYPE"])
    @check_id_with_type
    # allow id in folder enabled
    def get(self, request, *args, **kwargs):
        id = request.GET["id"]
        type = request.GET["TYPE"]

        if(type == "FILE"):
            start_node = File.objects.get(id=id)
        elif(type == "FOLDER"):
            request = allow_id_root_helper(request)
            id = request.GET["id"]
            start_node = Folder.objects.get(id=id)

        if(start_node.owner != request.user):
            return Response(data={"message": "Not allowed"}, status=status.HTTP_401_UNAUTHORIZED)

        path = get_path(start_node)
        return Response(data=path, status=status.HTTP_200_OK)


class Move(APIView):

    def get_child_object(self, child):
        type, id = child["type"], child["id"]
        if(type == "folder"):
            child_obj = Folder.objects.get(id=id)
        else:
            child_obj = File.objects.get(id=id)
        return child_obj

    def get_parent_object(self, child):
        child_obj = self.get_child_object(child)
        return child_obj.parent

    @check_request_attr(["PARENT", "CHILDREN"])
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_children
    @check_prev_parent_old_parent_different
    @check_new_parent_not_in_sub_directory
    def post(self, request, * args, **kwargs):
        new_parent = request.data.get("PARENT")
        new_parent = Folder.objects.get(id=new_parent)
        children = request.data.get("CHILDREN")
        prev_parent = self.get_parent_object(children[0])
        size_children = 0
        for child in children:
            child_obj = self.get_child_object(child)
            size_children += child_obj.size
            child_obj.parent = new_parent
            child_obj.save()
        propagate_size_change(prev_parent, -size_children)
        propagate_size_change(new_parent, size_children)
        data = {
            "new_parent": FolderSerializer(new_parent).data,
            "prev_parent": FolderSerializer(prev_parent).data,
        }

        return Response(data=data, status=status.HTTP_200_OK)


class RecoverFolder(APIView):

    @check_request_attr(["id"])
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
    @check_request_attr(["id"])
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
