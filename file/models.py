import os
# django imports
from django.db import models
from django.contrib.auth.models import User
from folder.models import Folder
import humanize

# local
from mysite.cloud_storage_providers import aws_s3_object as CLOUD_STORAGE_PROVIDER


class FileManager(models.Manager):
    def get_or_none(self, **kwargs):
        try:
            return File.objects.get(**kwargs)
        except:
            return None


class File(models.Model):
    file = models.FileField(blank=False, null=False)
    parent = models.ForeignKey(
        Folder, related_name="children_file", on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="files")
    shared_among = models.ManyToManyField(
        User, related_name="shared_files")
    present_in_shared_me_of = models.ManyToManyField(
        User, related_name="shared_with_me_files")
    privacy = models.BooleanField(default=True)
    trash = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
    temporary = models.BooleanField(default=False)
    size = models.IntegerField(default=0)
    objects = models.Manager()
    custom_objects = FileManager()

    def __str__(self):
        return f"{self.name}  => parent = {self.parent} "

    class Meta:
        ordering = ['-last_modified', 'pk']

    def get_created_at(self):
        return humanize.naturaltime(self.created_at)

    def get_last_modified(self):
        return humanize.naturaltime(self.last_modified)

    def make_key(self, name):
        return os.path.join(self.file.storage.location, name)

    def get_cloud_storage_key(self):
        return CLOUD_STORAGE_PROVIDER.get_cloud_storage_key(self)

    def download_to(self, parent_folder_path):
        CLOUD_STORAGE_PROVIDER.download_to(parent_folder_path, self)
