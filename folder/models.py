from django.db import models
from django.contrib.auth.models import User


class Folder(models.Model):
    parent = models.ForeignKey(
        'folder.Folder', related_name="children_folder", on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="folders")
    shared_among = models.ManyToManyField(
        User, related_name="shared_folders")
    privacy = models.BooleanField(default=True)
    trash = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
