import humanize
from rest_framework import fields, serializers
from .models import Profile

from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()
    profile_picture_url = serializers.CharField(
        source="profile.profile_picture_url", read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name',
                  'last_name', 'last_login', 'date_joined', 'profile_picture_url')

    def get_last_login(self, obj):
        return humanize.naturaltime(obj.last_login)

    def get_date_joined(self, obj):
        return humanize.naturaldate(obj.date_joined)


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    first_name = serializers.CharField(
        source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    root_id = serializers.CharField(source="root.id", read_only=True)
    gender = serializers.SerializerMethodField()
    storage_data = serializers.SerializerMethodField()
    storage_used = serializers.SerializerMethodField()
    storage_avail = serializers.SerializerMethodField()
    id = serializers.IntegerField(source="user.id", read_only=True)
    date_joined = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ('id', 'username', 'email', 'first_name',
                  'last_name', 'root_id', 'gender', 'storage_data',
                  'storage_used', 'storage_avail', 'profile_picture_url',
                  'date_joined', 'last_login')

    def get_gender(self, obj):
        options = {
            1: "Male",
            2: "Female",
            3: "Other",
            4: "Not Set",
        }
        return options[obj.gender]

    def get_date_joined(self, obj):
        return humanize.naturaldate(obj.user.date_joined)

    def get_last_login(self, obj):
        return humanize.naturaltime(obj.user.last_login)

    def get_storage_used(self, obj):
        return humanize.naturalsize(obj.storage_used)

    def get_storage_avail(self, obj):
        return humanize.naturalsize(obj.storage_avail)

    def get_storage_data(self, obj):
        used = obj.storage_used
        avail = obj.storage_avail
        readable_used = humanize.naturalsize(used)
        readable_avail = humanize.naturalsize(avail)

        data = {
            "readable": f"{readable_used} of {readable_avail}",
            "ratio": used/avail
        }

        return data
