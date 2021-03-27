from rest_framework import serializers
from .models import File

from django.contrib.auth.models import User


class FileSerializer(serializers.ModelSerializer):

    class Meta:
        model = File
        exclude = ('file',)
