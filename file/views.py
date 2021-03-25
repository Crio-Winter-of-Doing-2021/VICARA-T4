from varname import nameof
import secrets
import datetime
import os
import requests
# django imports
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.auth.models import AnonymousUser
from django.core.files import File as DjangoCoreFile
# local imports
from file.serializers import FileSerializer
from user.models import Profile
from .models import File
from mysite.constants import *
from mysite.decorators import *
from mysite.utils import delete_by_id
from .utils import get_presigned_url, get_s3_filename, rename_s3

REQUIRED_POST_PARAMS = [PARENT, "file"]
REQUIRED_DRIVE_POST_PARAMS = [PARENT, DRIVE_URL, NAME]
REQUIRED_PATCH_PARAMS = ["id"]

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
        filesystem_id = secrets.token_hex(16)
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
        return Response(data={**fileData, **filesystem[filesystem_id]}, status=status.HTTP_200_OK)

    @check_id
    @check_type_id(type_required=FILE)
    def delete(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        recent = profile.recent
        id = request.GET["id"]
        file_obj = File.objects.get(filesystem_id=id)
        file_obj.file.delete(save=False)
        delete_by_id(id, filesystem, favourites, recent)
        update_profile(profile, filesystem, favourites, recent)
        return Response(data={"id": id, "message": "Successfully deleted"}, status=status.HTTP_200_OK)

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
            new_name_file_system = request.data[NAME]
            """ will use this rename lines just before download"""
            # new_path = os.path.join(settings.MEDIA_ROOT, new_name)
            # initial_path = file_obj.file.path
            # os.rename(initial_path, new_path)
            old_file_key = file_obj.get_s3_key()
            s3_new_filename = get_s3_filename(new_name_file_system)
            new_file_key = file_obj.make_key(s3_new_filename)

            rename_s3(old_file_key, new_file_key)
            file_obj.file.name = s3_new_filename
            update_property(id, filesystem, recent, favourites,
                            NAME, new_name_file_system)

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
        file_obj.timestamp = datetime.datetime.now()
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
        if(file_obj.privacy == PUBLIC):
            allowed = True
        if(visitor == file_obj.creator or visitor in file_obj.users.all()):
            allowed = True
        if(allowed):
            fileData = FileSerializer(file_obj).data
            s3_key = file_obj.get_s3_key()
            signed_url = get_presigned_url(s3_key)
            print(f"{signed_url=}")
            fileData[URL] = signed_url
            return Response(data=fileData, status=status.HTTP_200_OK)
        else:
            return Response(data={"message": "action is UNAUTHORIZED"}, status=status.HTTP_401_UNAUTHORIZED)


class SharedWithMe(APIView):

    def get(self, request):
        shared_files = request.user.shared_files.all()
        data = FileSerializer(shared_files, many=True).data
        return Response(data=data, status=status.HTTP_200_OK)


class UploadByDriveUrl(APIView):

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_DRIVE_POST_PARAMS)
    @parent_present_and_folder
    @check_regex_file_name_from_request_body
    @check_already_present(to_check="req_data_name", type=FILE)
    def post(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = request.data[PARENT]
        drive_url = request.data[DRIVE_URL]
        name = request.data[NAME]
        children = filesystem[parent][CHILDREN]
        filesystem_id = secrets.token_hex(16)

        s3_name = get_s3_filename(name)
        r = requests.get(drive_url, allow_redirects=True)
        open(s3_name, 'wb').write(r.content)
        local_file = open(s3_name, 'rb')
        djangofile = DjangoCoreFile(local_file)
        file_obj = File(file=djangofile,
                        filesystem_id=filesystem_id, creator=request.user)
        file_obj.save()
        os.remove(s3_name)
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
        return Response(data={**fileData, **filesystem[filesystem_id]}, status=status.HTTP_200_OK)
