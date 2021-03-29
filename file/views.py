

# django imports
from django.contrib.auth.models import AnonymousUser
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
# local imports
from user.models import Profile
from .decorators import *
from folder.decorators import allow_parent_root, check_is_owner_parent_folder, check_id_parent_folder, check_parent_folder_not_trashed, check_request_attr, check_valid_name
from .serializers import FileSerializer
from .utils import get_presigned_url, get_s3_filename, rename_s3
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
    @allow_parent_root
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

        if("trash" in request.data):
            if(request.data["trash"] == False):
                updated = True
                file.trash = False
                file.save()
            else:
                return Response(data={"message": "Cant move to trash from PATCH"}, status=status.HTTP_200_OK)

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


class ShareFile(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        creator = request.GET["CREATOR"]
        try:
            creator = User.objects.get(id=creator)
        except:
            creator = None
        if(creator == None):
            return Response(data={"message": "Invalid creator"}, status=status.HTTP_400_BAD_REQUEST)
        id = request.GET["id"]
        try:
            file = File.objects.get(id=id)
        except:
            file = None

        if(file == None):
            return Response(data={"message": "Invalid file id"}, status=status.HTTP_400_BAD_REQUEST)

        if(file.owner != creator):
            return Response(data={"message": "Bad creator & id combination"}, status=status.HTTP_400_BAD_REQUEST)

        visitor = request.user
        allowed = False
        if(isinstance(visitor, AnonymousUser) and file.privacy == "PUBLIC"):
            allowed = True
        if(file.privacy == "PUBLIC"):
            allowed = True
        if(visitor == file.owner or visitor in file.shared_among.all()):
            allowed = True
        if(allowed):
            data = FileSerializer(file).data
            s3_key = file.get_s3_key()
            signed_url = get_presigned_url(s3_key)
            print(f"{signed_url=}")
            data["URL"] = signed_url
            return Response(data=data, status=status.HTTP_200_OK)
        else:
            return Response(data={"message": "action is UNAUTHORIZED"}, status=status.HTTP_401_UNAUTHORIZED)


# class SharedWithMe(APIView):

#     def get(self, request):
#         shared_files = request.user.shared_files.all()
#         data = FileSerializer(shared_files, many=True).data
#         return Response(data=data, status=status.HTTP_200_OK)


# class UploadByDriveUrl(APIView):

#     @check_request_attr(REQUIRED_PARAMS=REQUIRED_DRIVE_POST_PARAMS)
#     @parent_present_and_folder
#     @check_regex_file_name_from_request_body
#     @check_already_present(to_check="req_data_name", type=FILE)
#     def post(self, request, *args, **kwargs):
#         profile = Profile.objects.get(user=request.user)
#         filesystem = profile.filesystem
#         parent = request.data[PARENT]
#         drive_url = request.data[DRIVE_URL]
#         name = request.data[NAME]
#         children = filesystem[parent][CHILDREN]
#         filesystem_id = secrets.token_hex(16)

#         s3_name = get_s3_filename(name)
#         r = requests.get(drive_url, allow_redirects=True)
#         open(s3_name, 'wb').write(r.content)
#         local_file = open(s3_name, 'rb')
#         djangofile = DjangoCoreFile(local_file)
#         file_obj = File(file=djangofile,
#                         filesystem_id=filesystem_id, creator=request.user)
#         file_obj.save()
#         os.remove(s3_name)
#         children[filesystem_id] = {
#             TYPE: FILE,
#             NAME: name,
#             FAVOURITE: False,
#             PRIVACY: PRIVATE
#         }
#         filesystem[parent][CHILDREN] = children
#         filesystem[filesystem_id] = {
#             PARENT: parent,
#             TYPE: FILE,
#             NAME: name,
#             FAVOURITE: False,
#             PRIVACY: PRIVATE
#         }

#         update_profile(profile, filesystem)
#         fileData = FileSerializer(file_obj).data
#         return Response(data={**fileData, **filesystem[filesystem_id]}, status=status.HTTP_200_OK)
