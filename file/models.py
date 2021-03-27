from django.db import models
from django.contrib.auth.models import User
from folder.models import Folder


class File(models.Model):
    file = models.FileField(blank=False, null=False)
    parent = models.ForeignKey(
        Folder, related_name="children_file", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="files")
    shared_among = models.ManyToManyField(
        User, related_name="shared_files")
    privacy = models.BooleanField(default=True)
    trash = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
