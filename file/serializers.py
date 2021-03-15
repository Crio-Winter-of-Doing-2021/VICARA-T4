from rest_framework import serializers
from .models import File
from mysite.constants import TIMESTAMP


class FileSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    TIMESTAMP = serializers.SerializerMethodField()

    class Meta():
        model = File
        fields = ('file', 'id', TIMESTAMP)

    def get_id(self, obj):
        return obj.filesystem_id

    def get_TIMESTAMP(self, obj):
        return obj.timestamp
