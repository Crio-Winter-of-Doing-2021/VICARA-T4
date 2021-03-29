from itertools import chain

# django
from rest_framework import serializers
from .models import Folder
from django.contrib.humanize.templatetags import humanize
from django.contrib.auth.models import User
from file.serializers import FileSerializer


class FolderSerializerWithoutChildren(serializers.ModelSerializer):

    created_at = serializers.SerializerMethodField()
    last_modified = serializers.SerializerMethodField()
    shared_among = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = '__all__'
        # ordering = ['-last_modified']

    def get_created_at(self, obj):
        return humanize.naturaltime(obj.created_at)

    def get_last_modified(self, obj):
        return humanize.naturaltime(obj.last_modified)

    def get_shared_among(self, obj):
        shared_among = []
        for user in obj.shared_among.all():
            shared_among.append({
                "username": user.username,
                "id": user.id
            })
        return shared_among


class FolderSerializer(serializers.ModelSerializer):

    created_at = serializers.SerializerMethodField()
    last_modified = serializers.SerializerMethodField()
    shared_among = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = '__all__'
        # ordering = ['-last_modified']

    def get_created_at(self, obj):
        return humanize.naturaltime(obj.created_at)

    def get_last_modified(self, obj):
        return humanize.naturaltime(obj.last_modified)

    def get_children(self, obj):
        # folders
        folders = obj.children_folder
        folders = FolderSerializerWithoutChildren(folders, many=True).data
        for folder in folders:
            folder["type"] = "folder"
        # files
        files = obj.children_file
        files = FileSerializer(files, many=True).data
        for file in files:
            file["type"] = "file"

        # combined
        result_list = list(chain(folders, files))
        return result_list

    def get_shared_among(self, obj):
        shared_among = []
        for user in obj.shared_among.all():
            shared_among.append({
                "username": user.username,
                "id": user.id
            })
        return shared_among
