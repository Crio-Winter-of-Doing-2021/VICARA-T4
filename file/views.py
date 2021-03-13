from mysite.decorators import parent_present
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import FileSerializer
import secrets
import re
from user.models import Profile
from .models import File
from mysite.constants import FILE, PARENT, CHILDREN, FAVOURITE, NAME, FOLDER, TIMESTAMP, TYPE
REQUIRED_POST_PARAMS = [PARENT, "file"]
REQUIRED_PATCH_PARAMS = ["file_id", "new_name"]
REQUIRED_DELETE_PARAMS = ["file_id"]
REGEX_NAME = r"^[\w\-. ]+$"


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @parent_present
    def post(self, request, *args, **kwargs):

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        if not all(attr in request.data for attr in REQUIRED_POST_PARAMS):
            return Response(data={"message": f"Insufficient Post params req {REQUIRED_POST_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        parent = request.data[PARENT]
        name = request.FILES['file'].name

        if re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        elif filesystem[parent][TYPE] != "FOLDER":
            return Response(data={"message": "Parent is not a folder"}, status=status.HTTP_400_BAD_REQUEST)

        children = filesystem[parent][CHILDREN]
        for x in children:
            already_present_name = children[x][NAME]
            already_present_type = children[x][TYPE]
            if(name == already_present_name and FILE == already_present_type):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)

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

    def delete(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        recent = profile.recent

        if not all(attr in request.data for attr in REQUIRED_DELETE_PARAMS):
            return Response(data={"message": f"Insufficient Post params req {REQUIRED_DELETE_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        file_id = request.data["file_id"]

        if file_id not in filesystem:
            return Response(data={"message": "Invalid file id"}, status=status.HTTP_400_BAD_REQUEST)
        elif filesystem[file_id][TYPE] != FILE:
            return Response(data={"message": "id sent is not of a file"}, status=status.HTTP_400_BAD_REQUEST)

        parent = filesystem[file_id][PARENT]
        children = filesystem[parent][CHILDREN]

        file_obj = File.objects.get(filesystem_id=file_id).delete()

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

    def patch(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        if not all(attr in request.data for attr in REQUIRED_PATCH_PARAMS):
            return Response(data={"message": f"Insufficient Post params req {REQUIRED_PATCH_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        file_id = request.data["file_id"]
        new_name = request.data["new_name"]

        if file_id not in filesystem:
            return Response(data={"message": "Invalid file id"}, status=status.HTTP_400_BAD_REQUEST)
        elif re.match(REGEX_NAME, new_name) is None:
            return Response(data={"message": "Invalid New Name"}, status=status.HTTP_400_BAD_REQUEST)

        parent = filesystem[file_id][PARENT]
        children = filesystem[parent][CHILDREN]
        for x in children:
            already_present_name = children[x][NAME]
            already_present_type = children[x][TYPE]
            if(new_name == already_present_name and FILE == already_present_type):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = File.objects.get(filesystem_id=file_id)
        file_obj.file.name = new_name
        file_obj.save()
        children[file_id][NAME] = new_name
        filesystem[parent][CHILDREN] = children
        filesystem[file_id][NAME] = new_name
        profile.filesystem = filesystem
        profile.save()
        return Response(data=filesystem, status=status.HTTP_200_OK)
