from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import FileSerializer
import secrets
import re
from user.models import Profile
from .models import File
REQUIRED_POST_PARAMS = ["PARENT", "FILE"]
REGEX_NAME = r"^[\w\-. ]+$"


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        # to-do check valid form field or not
        if not all(attr in request.data for attr in REQUIRED_POST_PARAMS):
            return Response(data={"message": f"Insufficient Post params req {REQUIRED_POST_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        parent = request.data["PARENT"]
        name = request.FILES['FILE'].name
        print(name)
        if parent not in filesystem:
            return Response(data={"message": "Invalid parent"}, status=status.HTTP_400_BAD_REQUEST)
        elif re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        elif filesystem[parent]["TYPE"] != "FOLDER":
            return Response(data={"message": "Parent is not a folder"}, status=status.HTTP_400_BAD_REQUEST)

        print(request.data)
        children = filesystem[parent]["CHILDREN"]
        for x in children:
            already_present_name = children[x]["NAME"]
            already_present_type = children[x]["TYPE"]
            if(name == already_present_name and "FILE" == already_present_type):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)

        file_id = secrets.token_urlsafe(16)

        print(request.data)
        file_object = File.objects.create(
            filesystem_id=file_id,
            file=request.FILES['FILE']
        )
        file_object.save()
        file_serializer = FileSerializer(data=file_object)
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
