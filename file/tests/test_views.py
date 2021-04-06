import os
from rest_framework.authtoken.models import Token
import humanize
from django.core.files import File as DjangoCoreFile
from file.models import File
from file.utils import create_file
from folder.models import Folder
from rest_framework import status
from rest_framework.test import APITestCase
from user.models import User
from mysite.settings import BASE_DIR
from django.core.files.uploadedfile import SimpleUploadedFile


class FileViewTest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
            username='username',
            email='email',
        )
        self.user.set_password('password')
        self.user.save()
        self.second_user = User.objects.create(
            username='username2',
            email='email2',
        )
        self.second_user.set_password('password')
        self.second_user.save()
        self.authenticate_client()
        self.make_root_folder()
        self.child_folder = Folder.objects.create(
            parent=self.root_folder, owner=self.user, name='test folder')
        self.child_folder.save()
        self.req_file = self.get_test_file("file 1.txt")
        req_file_size = humanize.naturalsize(self.req_file.size)
        self.child_file = create_file(
            self.user, self.req_file, self.root_folder, "file 1.txt", req_file_size)

        self.file_endpoint = "/api/file/"
        self.file_endpoint_upload_by_url = "/api/file/upload-by-url/"

    def make_root_folder(self):
        self.root_folder = Folder.objects.create(
            parent=None, owner=self.user, name='root folder')
        self.root_folder.save()
        self.user.profile.root = self.root_folder
        self.user.save()

    def authenticate_client(self):
        self.token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def get_test_file(self, name):
        return SimpleUploadedFile(
            name,
            # note the b in front of the string [bytes]
            b"7 bytes"
        )

    def test_file_detail(self):
        res = self.client.get(self.file_endpoint+"?id=1")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_file_post(self):

        test_file = self.get_test_file("file 2.txt")
        res = self.client.post(self.file_endpoint, {
            'PARENT': 'ROOT', 'file': test_file})

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_file_post_url(self):
        post_data = {
            "PARENT": "ROOT",
            "DRIVE_URL": "https://openthread.google.cn/images/ot-contrib-google.png",
            "NAME": "file 3.png"
        }

        res = self.client.post(self.file_endpoint_upload_by_urlw, post_data)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_file_patch(self):
        patch_data = {
            "id": 1,
            "trash": True,
            "name": "new_name.txt",
            "privacy": False,
            "favourite": True,
            "shared_among": [2]
        }

        res = self.client.patch(self.file_endpoint, patch_data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_file_delete(self):
        res = self.client.delete(self.file_endpoint+"?id=1")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
