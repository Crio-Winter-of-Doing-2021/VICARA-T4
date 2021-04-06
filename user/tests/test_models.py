from django.test import TestCase
from folder.models import Folder
from user.models import User, Profile


class FolderTest(TestCase):

    @classmethod
    def setUpTestData(cls):

        user = User.objects.create(
            username='username',
            email='email@id.com',
            first_name="first",
            last_name="last"
        )
        user.set_password('password')
        user.save()
        # root_folder = Folder.objects.create(
        #     parent=None, owner=user, name='root folder')
        # root_folder.save()
        # child_folder = Folder.objects.create(
        #     parent=root_folder, owner=user, name='test folder')
        # child_folder.save()
        pass

    def setUp(self):

        pass

    def test_get_or_none(self):
        result_none = Profile.custom_objects.get_or_none(id=40)
        result_not_none = Profile.custom_objects.get_or_none(id=1)
        first_profile = Profile.objects.get(id=1)
        self.assertTrue(result_none == None)
        self.assertTrue(result_not_none == first_profile)

    def test_full_name(self):
        profile = Profile.objects.get(id=1)
        full_name = profile.get_full_name()
        self.assertTrue(full_name == "first last")

    def test_print(self):
        profile = Profile.objects.get(id=1)
        print(profile)
        self.assertTrue(
            str(profile) == "username | email = email@id.com")
