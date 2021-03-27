from rest_framework.authtoken.models import Token
from rest_framework import serializers
from .models import Profile

from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name')


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(
        source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    root_id = serializers.CharField(source="root.id", read_only=True)

    class Meta:
        model = Profile
        fields = ['first_name',
                  'last_name', 'id', 'username', 'root_id']

    def get_auth_token(self, obj):
        user = User.objects.get(profile=obj)
        token, _ = Token.objects.get_or_create(user=user)
        return str(token)
