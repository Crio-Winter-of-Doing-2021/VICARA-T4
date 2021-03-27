from rest_framework.authtoken.models import Token
from rest_framework import serializers
from .models import Folder

from django.contrib.auth.models import User


class FolderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Folder
        fields = '__all__'
