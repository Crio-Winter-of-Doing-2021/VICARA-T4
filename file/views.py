from file.tasks import remove_file
import humanize
# django imports
from django.http import StreamingHttpResponse
import requests
import os
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.files import File as DjangoCoreFile
# local imports
from .decorators import *
from folder.decorators import allow_parent_root, check_is_owner_parent_folder, check_id_parent_folder, check_parent_folder_not_trashed, check_request_attr, check_valid_name
from .serializers import FileSerializer
from user.serializers import ProfileSerializer
from .utils import get_presigned_url, get_s3_filename, rename_s3, create_file
from user.tasks import send_mail, sync_send_mail
from user.utils import get_client_server
from user.serializers import UserSerializer
POST_FILE = ["file", "PARENT"]
PATCH_FILE = ["id"]
REQUIRED_DRIVE_POST_PARAMS = ["PARENT", "DRIVE_URL", "NAME"]


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @check_id_file
    @check_has_access_file
    @check_file_not_trashed
    @update_last_modified_file
    def get(self, request, * args, **kwargs):
        id = request.GET["id"]
        file = File.objects.get(id=id)
        data = FileSerializer(file).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_request_attr(POST_FILE)
    # @check_valid_name_request_file
    @allow_parent_root
    @check_id_parent_folder
    @check_is_owner_parent_folder
    @check_parent_folder_not_trashed
    @check_already_present(to_check="req_file_name")
    @check_storage_available
    def post(self, request, * args, **kwargs):
        parent_id = request.data["PARENT"]
        parent = Folder.objects.get(id=parent_id)
        data = []
        for req_file in request.FILES.getlist('file'):
            req_file_name = req_file.name
            req_file_size = humanize.naturalsize(req_file.size)
            new_file = create_file(
                request.user, req_file, parent, req_file_name, req_file_size)
            request.user.profile.storage_used = request.user.profile.storage_used + req_file.size
            request.user.profile.save()
            new_file = FileSerializer(new_file).data
            data.append(new_file)
        storage_data = ProfileSerializer(
            request.user.profile).data["storage_data"]
        return Response(data={"file_data": data, **storage_data}, status=status.HTTP_201_CREATED)

    # @check_valid_name
    @check_id_file
    @check_is_owner_file
    @check_file_not_trashed
    @check_already_present(to_check="req_data_name")
    def patch(self, request, * args, **kwargs):
        id = request.data["id"]
        file = File.objects.get(id=id)

        if("trash" in request.data):
            new_trash = request.data["trash"]
            # if we are moving to trash
            if(new_trash):
                # file was not trashed
                if(new_trash != file.trash):
                    updated = True
                    file.trash = new_trash
                else:
                    return Response(data={"message": "Already in Trash"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(data={"message": "Use Recovery route to recover file"}, status=status.HTTP_400_BAD_REQUEST)

        if("name" in request.data):
            updated = True
            new_name_file_system = request.data["name"]
            """ will use this rename lines just before download"""
            # new_path = os.path.join(settings.MEDIA_ROOT, new_name)
            # initial_path = file_obj.file.path
            # os.rename(initial_path, new_path)
            old_file_key = file.get_s3_key()
            s3_new_filename = get_s3_filename(new_name_file_system)
            new_file_key = file.make_key(s3_new_filename)

            rename_s3(old_file_key, new_file_key)
            file.file.name = s3_new_filename
            file.name = new_name_file_system

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
            ids = set(ids)
            ids.discard(file.owner.id)
            ids = list(ids)

            try:
                users = [User.objects.get(pk=id)
                         for id in ids]

                users_json = UserSerializer(users, many=True).data

                client = get_client_server(request)["client"]
                title_kwargs = {
                    "sender_name": request.user.username,
                    "resource_name": f'a file "{file.name}"'
                }
                body_kwargs = {
                    "resource_url": f"{client}/share/file/{file.id}"
                }
                sync_send_mail.delay("SHARED_WITH_ME", users_json,
                                     title_kwargs, body_kwargs)
            except Exception as e:
                print(e)
                return Response(data={"message": "invalid share id list"}, status=status.HTTP_400_BAD_REQUEST)
            file.shared_among.set(users)
            file.present_in_shared_me_of.set(users)

        if(updated):
            file.save()
        data = FileSerializer(file).data
        return Response(data=data, status=status.HTTP_200_OK)

    @check_id_file
    @check_is_owner_file
    def delete(self, request, * args, **kwargs):
        id = get_id(request)
        file = File.objects.get(id=id)
        size = file.get_size()
        file.owner.profile.storage_used -= size
        file.owner.profile.save()
        file.delete()
        storage_data = ProfileSerializer(
            file.owner.profile).data["storage_data"]
        return Response(data={"id": id, "storage_data": storage_data}, status=status.HTTP_200_OK)


class UploadByDriveUrl(APIView):

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_DRIVE_POST_PARAMS)
    @allow_parent_root
    @check_id_parent_folder
    # @check_valid_name_request_body
    @check_already_present(to_check="req_data_name")
    def post(self, request, *args, **kwargs):

        parent = request.data["PARENT"]
        drive_url = request.data["DRIVE_URL"]
        name = request.data["NAME"]

        parent_folder = Folder.objects.get(id=parent)
        s3_name = get_s3_filename(name)
        r = requests.get(drive_url, allow_redirects=True)
        open(s3_name, 'wb').write(r.content)
        local_file = open(s3_name, 'rb')
        djangofile = DjangoCoreFile(local_file)
        file = File(file=djangofile,
                    name=name,
                    owner=request.user,
                    parent=parent_folder)
        file.save()
        os.remove(s3_name)
        # remove_file.delay(s3_name)
        data = FileSerializer(file).data
        profile = request.user.profile
        profile.storage_used += file.get_size()
        profile.save()
        storage_data = ProfileSerializer(
            file.owner.profile).data["storage_data"]
        return Response(data={**data, **storage_data}, status=status.HTTP_200_OK)


class DownloadFile(APIView):

    @check_id_file
    @check_has_access_file
    @check_file_not_trashed
    @update_last_modified_file
    def get(self, request, *args, **kwargs):
        id = request.GET["id"]
        file = File.objects.get(id=id)
        url = get_presigned_url(file.get_s3_key())
        return Response(data={"url": url}, status=status.HTTP_200_OK)
