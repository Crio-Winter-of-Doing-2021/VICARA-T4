from django.db import models
from django.contrib.auth.models import User
from folder.models import Folder


class File(models.Model):
    pass


class File(models.Model):
    file = models.FileField(blank=False, null=False)
    parent = models.ForeignKey(
        Folder, related_name="children_file", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now_add=True)
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    shared_among = models.ForeignKey(
        User, related_name="shared_files", on_delete=models.DO_NOTHING, null=True)
    privacy = models.BooleanField(default=False)
    trash = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
