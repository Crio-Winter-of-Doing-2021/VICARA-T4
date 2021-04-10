import os
import boto3
# django imports
from django.db import models
from django.contrib.auth.models import User
from folder.models import Folder
import humanize

# local
from mysite.settings import AWS_STORAGE_BUCKET_NAME


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

    def get_s3_key(self):
        return os.path.join(self.file.storage.location, self.file.name)

    def make_key(self, name):
        return os.path.join(self.file.storage.location, name)

    def get_size(self):
        s3 = boto3.resource('s3')
        object = s3.Object(AWS_STORAGE_BUCKET_NAME, self.get_s3_key())
        file_size = object.content_length  # size in bytes
        return file_size

    def download_to(self, parent_folder_path):
        path_file = parent_folder_path.joinpath(self.name)
        print(str(path_file))
        s3 = boto3.client('s3')
        s3.download_file(AWS_STORAGE_BUCKET_NAME,
                         self.get_s3_key(), str(path_file))
