# django imports
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# local imports
from .models import Profile
from .serializers import ProfileSerializer
from folder.models import Folder
from .serializers import ProfileSerializer, UserSerializer


class LoginView(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        profile = Profile.objects.get(user=user)
        data = ProfileSerializer(profile).data
        return Response({'token': token.key, **data}, status=status.HTTP_201_CREATED)


class Register(APIView):
    def post(self, request):
        if User.objects.filter(username=request.data.get('username'),).exists():
            return Response({"message": "Already Present"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create(
            username=request.data.get('username'),
            email=request.data.get('username'),
        )
        user.set_password(str(request.data.get('password')))
        user.save()
        token, created = Token.objects.get_or_create(user=user)
        profile = Profile.objects.get(user=user)
        root_folder = Folder(name="ROOT", owner=user)
        root_folder.save()
        profile.root = root_folder
        profile.save()
        data = ProfileSerializer(profile).data
        return Response({'token': token.key, **data}, status=status.HTTP_201_CREATED)


class Logout(APIView):
    def post(self, request, *args, **kwargs):
        print(request.user)
        request.user.auth_token.delete()
        return Response({"message": "logged out"}, status=status.HTTP_200_OK)


class ProfileView(APIView):
    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        data = ProfileSerializer(profile).data
        return Response(data=data)

    def patch(self, request):
        profile = Profile.objects.get(user=request.user)
        serializer = ProfileSerializer(
            profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)


class ListOfUsers(APIView):

    def get(self, request):
        data = UserSerializer(User.objects.all(), many=True).data
        return Response(data=data, status=status.HTTP_200_OK)
