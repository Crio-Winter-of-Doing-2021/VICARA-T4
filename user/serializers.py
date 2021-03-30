from rest_framework.authtoken.models import Token
from rest_framework import serializers
from .models import Profile

from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # fields = ('username', 'first_name', 'last_name')


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    first_name = serializers.CharField(
        source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    root_id = serializers.CharField(source="root.id", read_only=True)
    gender = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = '__all__'

    def get_gender(self, obj):
        options = {
            1: "Male",
            2: "Female",
            3: "Other",
            4: "Not Set",
        }
        return options[obj.gender]
