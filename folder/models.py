from django.db import models
from django.contrib.auth.models import User


class Folder(models.Model):
    parent = models.ForeignKey(
        'folder.Folder', related_name="children_folder", on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now_add=True)
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    shared_among = models.ForeignKey(
        User, related_name="shared_folders", on_delete=models.DO_NOTHING, null=True)
    privacy = models.BooleanField(default=False)
    trash = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
