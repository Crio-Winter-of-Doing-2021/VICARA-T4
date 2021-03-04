from rest_framework.authtoken.models import Token
from rest_framework import serializers
from django.contrib.auth import get_user_model, password_validation, authenticate
from .models import Profile
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(
        source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    # auth_token = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['filesystem', 'first_name',
                  'last_name', 'id', 'username']

    def get_auth_token(self, obj):
        user = User.objects.get(profile=obj)
        token, _ = Token.objects.get_or_create(user=user)
        return str(token)
