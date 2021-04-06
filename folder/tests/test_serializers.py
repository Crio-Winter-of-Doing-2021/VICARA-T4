from django.test import TestCase
from folder.models import Folder
from folder.serializers import FolderSerializer, FolderSerializerWithoutChildren
from user.models import User
from user.serializers import UserSerializer


class FolderSerializerTest(TestCase):

    @classmethod
    def setUpTestData(cls):

        user = User.objects.create(
            username='username',
            email='email',
        )
        user.set_password('password')
        user.save()
        user2 = User.objects.create(
            username='username2',
            email='email2',
        )
        user2.set_password('password2')
        user2.save()
        root_folder = Folder.objects.create(
            parent=None, owner=user, name='root folder')
        root_folder.save()
        child_folder = Folder.objects.create(
            parent=root_folder, owner=user, name='test folder')

        child_folder.shared_among.set([2])
        child_folder.save()
        pass

    def setUp(self):

        pass

    def test_get_created_at(self):
        root_folder = Folder.objects.get(id=1)
        data = FolderSerializerWithoutChildren(
            root_folder).data["created_at"]
        self.assertTrue(data == "now")

    def test_get_last_modified(self):
        root_folder = Folder.objects.get(id=1)
        data = FolderSerializerWithoutChildren(
            root_folder).data["last_modified"]
        self.assertTrue(data == "now")

    def test_get_shared_among(self):
        root_folder = Folder.objects.get(id=1)
        data_folder_serializer = FolderSerializerWithoutChildren(
            root_folder).data["shared_among"]
        data_user_serializer = UserSerializer(
            root_folder.shared_among.all(), many=True).data
        self.assertTrue(data_folder_serializer == data_user_serializer)
