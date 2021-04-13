from django.db import models
from django.contrib.auth.models import User
import humanize
from django.utils import tree


class FolderManager(models.Manager):
    def get_or_none(self, **kwargs):
        try:
            return Folder.objects.get(**kwargs)
        except Exception as e:
            print(e)
            return None


class Folder(models.Model):
    parent = models.ForeignKey(
        'folder.Folder', related_name="children_folder", on_delete=models.CASCADE, null=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="folders")
    shared_among = models.ManyToManyField(
        User, related_name="shared_folders")
    present_in_shared_me_of = models.ManyToManyField(
        User, related_name="shared_with_me_folders")
    size = models.IntegerField(default=0)
    privacy = models.BooleanField(default=True)
    trash = models.BooleanField(default=False)
    favourite = models.BooleanField(default=False)
    objects = models.Manager()
    custom_objects = FolderManager()

    def __str__(self):
        return f"{self.name} => parent = {self.parent} "

    class Meta:
        ordering = ['-last_modified', 'pk']

    def get_created_at(self):
        return humanize.naturaltime(self.created_at)

    def get_last_modified(self):
        return humanize.naturaltime(self.last_modified)

    def is_root(self):
        return self.parent == None
