

# django imports
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
# local imports
from user.models import Profile
from .decorators import *
from folder.decorators import check_is_owner_parent_folder, check_id_parent_folder, check_parent_folder_not_trashed, check_request_attr, check_valid_name
from .serializers import FileSerializer
POST_FILE = ["file", "PARENT"]
PATCH_FILE = ["id"]


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @check_id_file
    @check_has_access_file
    @update_last_modified_file
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        file = File.objects.get(id=id)
        data = FileSerializer(file).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_request_attr(POST_FILE)
    @check_valid_name_request_file
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_duplicate_file_exists
    def post(self, request, * args, **kwargs):
        parent_id = request.data["PARENT"]
        parent = Folder.objects.get(id=parent_id)
        req_file = request.FILES['file']
        req_file_name = request.FILES['file'].name

        new_file = File(owner=request.user, file=req_file,
                        parent=parent, name=req_file_name)
        new_file.save()

        data = FileSerializer(new_file).data
        return Response(data=data, status=status.HTTP_201_CREATED)

    @check_valid_name
    @check_id_file
    @check_is_owner_file
    @check_file_not_trashed
    @check_duplicate_file_exists
    def patch(self, request, * args, **kwargs):
        id = request.data["id"]
        file = File.objects.get(id=id)

        if("privacy" in request.data):
            updated = True
            file.privacy = request.data["privacy"]

        if("favourite" in request.data):
            updated = True
            file.favourite = request.data["favourite"]
        if("shared_among" in request.data):
            updated = True
            ids = request.data["shared_among"]

            # make unique & discard owner
            ids.discard(file.owner.id)
            ids = list(ids)

            users = [User.objects.get(pk=id)
                     for id in ids]
            file.shared_among.set(users)
        if("trash" in request.data):
            if(request.data["trash"] == False):
                updated = True
                file.trash = False
                file.save()
            else:
                return Response(data={"message": "Cant move to trash from PATCH"}, status=status.HTTP_200_OK)
            file.shared_among.set(users)

        if(updated):
            file.save()
        data = FileSerializer(file).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_id_file
    @check_is_owner_file
    def delete(self, request, * args, **kwargs):
        id = get_id(request)
        file = File.objects.get(id=id)
        if (not file.trash):
            file.trash = True
            file.save()
        else:
            file.delete()
        return Response(data={"id": id}, status=status.HTTP_200_OK)
