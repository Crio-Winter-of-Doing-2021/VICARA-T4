from rest_framework import serializers
from .models import File
from django.contrib.humanize.templatetags import humanize
from django.contrib.auth.models import User


class FileSerializer(serializers.ModelSerializer):

    created_at = serializers.SerializerMethodField()
    last_modified = serializers.SerializerMethodField()
    shared_among = serializers.SerializerMethodField()

    class Meta:
        model = File
        exclude = ('file',)
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
                "id": id
            })
        return shared_among
