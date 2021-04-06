# from django.test import TestCase
# from folder.models import Folder
# from user.models import User


# class FolderTest(TestCase):

#     @classmethod
#     def setUpTestData(cls):
#
#         user = User.objects.create(
#             username='username',
#             email='email',
#         )
#         user.set_password('password')
#         user.save()
#         root_folder = Folder.objects.create(
#             parent=None, owner=user, name='root folder')
#         root_folder.save()
#         child_folder = Folder.objects.create(
#             parent=root_folder, owner=user, name='test folder')
#         child_folder.save()
#         pass

#     def setUp(self):
#
#         pass

#     def test_is_root(self):
#         root_folder = Folder.objects.get(id=1)
#         self.assertTrue(root_folder.is_root())

#     def test_created_at(self):
#         root_folder = Folder.objects.get(id=1)
#         self.assertTrue(root_folder.get_created_at() == "now")

#     def test_last_modified(self):
#         root_folder = Folder.objects.get(id=1)
#         self.assertTrue(root_folder.get_last_modified() == "now")

#     def test_get_or_none(self):
#         result_none = Folder.custom_objects.get_or_none(id=40)
#         result_not_none = Folder.custom_objects.get_or_none(id=1)
#         root_folder = Folder.objects.get(id=1)
#         self.assertTrue(result_none == None)
#         self.assertTrue(result_not_none == root_folder)
