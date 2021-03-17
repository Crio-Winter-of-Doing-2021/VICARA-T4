from rest_framework import serializers
from .models import File
from mysite.constants import *


class FileSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    TIMESTAMP = serializers.SerializerMethodField()
    CREATOR = serializers.SerializerMethodField()
    USERS = serializers.SerializerMethodField()
    PRIVACY = serializers.SerializerMethodField()

    class Meta():
        model = File
        fields = ('file', 'id', PRIVACY, USERS, CREATOR, TIMESTAMP)

    def get_id(self, obj):
        return obj.filesystem_id

    def get_TIMESTAMP(self, obj):
        return obj.timestamp

    def get_CREATOR(self, obj):
        return obj.creator.username

    def get_PRIVACY(self, obj):
        return obj.privacy

    def get_USERS(self, obj):
        return [user.username for user in obj.users.all()]
