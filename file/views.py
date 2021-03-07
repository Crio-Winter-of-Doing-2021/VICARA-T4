from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import FileSerializer

import re
from user.models import Profile
from .models import File
REQUIRED_POST_PARAMS = ["PARENT", "file"]
REQUIRED_PATCH_PARAMS = ["file_id", "new_name"]
REGEX_NAME = r"^[\w\-. ]+$"


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request, *args, **kwargs):

        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        if not all(attr in request.data for attr in REQUIRED_POST_PARAMS):
            return Response(data={"message": f"Insufficient Post params req {REQUIRED_POST_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        parent = request.data["PARENT"]
        name = request.FILES['file'].name

        if parent not in filesystem:
            return Response(data={"message": "Invalid parent"}, status=status.HTTP_400_BAD_REQUEST)
        elif re.match(REGEX_NAME, name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)
        elif filesystem[parent]["TYPE"] != "FOLDER":
            return Response(data={"message": "Parent is not a folder"}, status=status.HTTP_400_BAD_REQUEST)

        children = filesystem[parent]["CHILDREN"]
        for x in children:
            already_present_name = children[x]["NAME"]
            already_present_type = children[x]["TYPE"]
            if(name == already_present_name and "FILE" == already_present_type):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)

        file_serializer = FileSerializer(
            data=request.data, context={"filesystem_id": "123456"})

        if file_serializer.is_valid():
            file_serializer.save()
            print("file serializer data", file_serializer.data)
            # id = file_serializer.data["filesystem_id"]
            # children[id] = {
            #     "TYPE": "FILE",
            #     "NAME": name
            # }
            # filesystem[parent]["CHILDREN"] = children
            # filesystem[id] = {
            #     "PARENT": parent,
            #     "TYPE": "FILE",
            #     "NAME": name
            # }
            # profile.filesystem = filesystem
            # profile.save()

            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem

        if not all(attr in request.data for attr in REQUIRED_PATCH_PARAMS):
            return Response(data={"message": f"Insufficient Post params req {REQUIRED_PATCH_PARAMS}"}, status=status.HTTP_400_BAD_REQUEST)

        file_id = request.data["file_id"]
        new_name = request.data["new_name"]

        if file_id not in filesystem:
            return Response(data={"message": "Invalid parent"}, status=status.HTTP_400_BAD_REQUEST)
        elif re.match(REGEX_NAME, new_name) is None:
            return Response(data={"message": "Invalid Name"}, status=status.HTTP_400_BAD_REQUEST)

        parent = filesystem[file_id]["PARENT"]
        children = filesystem[parent]["CHILDREN"]
        for x in children:
            already_present_name = children[x]["NAME"]
            already_present_type = children[x]["TYPE"]
            if(new_name == already_present_name and "FILE" == already_present_type):
                return Response(data={"message": "Such a file/folder is already present"}, status=status.HTTP_400_BAD_REQUEST)

        print(file_id)
        file_obj = File.objects.get(filesystem_id=file_id)
        print(file_obj.file.name)
        return Response("ok ok", status=status.HTTP_200_OK)
        # if file_serializer.is_valid():
        #     file_serializer.save()
        #     id = file_serializer.data["filesystem_id"]
        #     children[id] = {
        #         "TYPE": "FILE",
        #         "NAME": name
        #     }
        #     filesystem[parent]["CHILDREN"] = children
        #     filesystem[id] = {
        #         "PARENT": parent,
        #         "TYPE": "FILE",
        #         "NAME": name
        #     }
        #     profile.filesystem = filesystem
        #     profile.save()
        #     return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        # else:
        #     return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
