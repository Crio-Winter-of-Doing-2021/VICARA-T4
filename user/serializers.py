from mysite.constants import ROOT
from rest_framework.authtoken.models import Token
from rest_framework import serializers
from .models import Profile

from django.contrib.auth import get_user_model
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name')


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(
        source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    # auth_token = serializers.SerializerMethodField()
    filesystem = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['filesystem', 'first_name',
                  'last_name', 'id', 'username']

    def get_auth_token(self, obj):
        user = User.objects.get(profile=obj)
        token, _ = Token.objects.get_or_create(user=user)
        return str(token)

    def get_filesystem(self, obj):
        return {ROOT: obj.filesystem[ROOT]}
