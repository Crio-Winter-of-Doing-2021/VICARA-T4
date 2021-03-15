from varname import nameof
import secrets

# django imports
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status

# local imports
from user.models import Profile
from .models import File
from mysite.constants import *
from mysite.decorators import *
from mysite.utils import delete_by_id
REQUIRED_POST_PARAMS = [PARENT, "file"]
REQUIRED_PATCH_PARAMS = ["id", "NAME"]
REQUIRED_DELETE_PARAMS = ["id"]
REGEX_NAME = r"^[\w\-. ]+$"


def update_profile(profile, *args):
    for attr in args:
        setattr(profile, nameof(attr), attr)
    profile.save()


class FileView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

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
        update_profile(profile, filesystem)
        return Response(data=filesystem[filesystem_id], status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_DELETE_PARAMS)
    @check_id
    @check_type_id(type_required=FILE)
    def delete(self, request, *args, **kwargs):
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        favourites = profile.favourites
        recent = profile.recent
        id = request.data["id"]
        delete_by_id(id, filesystem, favourites, recent)
        update_profile(profile, filesystem, favourites, recent)
        return Response(data={"message": "Successfully deleted"}, status=status.HTTP_200_OK)

    @check_request_attr(REQUIRED_PARAMS=REQUIRED_PATCH_PARAMS)
    @check_id
    @check_regex_file_name_from_request_body
    @check_equality_old_new_name
    @check_already_present(to_check="req_data_name", type=FILE)
    def patch(self, request, *args, **kwargs):

        id = request.data["id"]
        new_name = request.data["NAME"]
        profile = Profile.objects.get(user=request.user)
        filesystem = profile.filesystem
        parent = filesystem[id][PARENT]
        children = filesystem[parent][CHILDREN]
        file_obj = File.objects.get(filesystem_id=id)
        file_obj.file.name = new_name
        file_obj.save()
        children[id][NAME] = new_name
        filesystem[parent][CHILDREN] = children
        filesystem[id][NAME] = new_name
        update_profile(profile, filesystem, children)
        return Response(data=filesystem[id], status=status.HTTP_200_OK)
