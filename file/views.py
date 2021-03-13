from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import FileSerializer
import secrets
import re
from user.models import Profile
from .models import File
from mysite.constants import *
from mysite.decorators import *
REQUIRED_POST_PARAMS = [PARENT, "file"]
REQUIRED_PATCH_PARAMS = ["file_id", "new_name"]
REQUIRED_DELETE_PARAMS = ["file_id"]
REGEX_NAME = r"^[\w\-. ]+$"


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_POST_PARAMS)
    @check_regex
    @check_parent
    @check_type(type_required=FOLDER)
    @check_already_present
    def post(self, request, *args, **kwargs):

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = request.data[PARENT]
        name = request.FILES['file'].name
        children = filesystem[parent][CHILDREN]

        filesystem_id = secrets.token_urlsafe(16)
        file_obj = File(
            file=request.FILES['file'], filesystem_id=filesystem_id)
        file_obj.save()
        children[filesystem_id] = {
            TYPE: FILE,
            NAME: name,
            FAVOURITE: False
        }
        filesystem[parent][CHILDREN] = children
        filesystem[filesystem_id] = {
            PARENT: parent,
            TYPE: FILE,
            NAME: name,
            FAVOURITE: False
        }
        profile.filesystem = filesystem
        profile.save()
        return Response(data=filesystem, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_DELETE_PARAMS)
    @check_id
    @check_type(type_required=FILE)
    def delete(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        recent = profile.recent

        file_id = request.data["file_id"]

        parent = filesystem[file_id][PARENT]

        filesystem[parent][CHILDREN].pop(file_id)
        filesystem.pop(file_id)
        if file_id in favourites:
            favourites.pop(file_id)
        if id in recent:
            recent.pop(file_id)

        profile.filesystem = filesystem
        profile.favourites = favourites
        profile.recent = recent
        profile.save()
        return Response(data=filesystem, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_PATCH_PARAMS)
    @check_id
    @check_regex
    @check_already_present
    def patch(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        file_id = request.data["file_id"]
        new_name = request.data["new_name"]

        parent = filesystem[file_id][PARENT]
        children = filesystem[parent][CHILDREN]

        file_obj = File.objects.get(filesystem_id=file_id)
        file_obj.file.name = new_name
        file_obj.save()
        children[file_id][NAME] = new_name
        filesystem[parent][CHILDREN] = children
        filesystem[file_id][NAME] = new_name
        profile.filesystem = filesystem
        profile.save()
        return Response(data=filesystem, status=status.HTTP_200_OK)
