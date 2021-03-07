from rest_framework import serializers
from .models import File
import secrets


class FileSerializer(serializers.ModelSerializer):
    filesystem_id = serializers.SerializerMethodField()

    class Meta():
        model = File
        fields = ('file', 'filesystem_id', 'timestamp')

    def get_filesystem_id(self, obj):
        if "filesystem_id" in self.context:
            return self.context["filesystem_id"]
        return "nai tha"
