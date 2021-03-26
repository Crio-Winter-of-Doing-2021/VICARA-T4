from django.db import models
from django.contrib.auth.models import User
from folder.models import Folder
class File(models.Model):
    pass

class File(models.Model):
    file = models.FileField(blank=False, null=False)
    parent = models.ManyToManyField(Folder, on_delete=models.CASCADE,related_name="children")
    name = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    owner = models.OneToOneField(User, on_delete=models.CASCADE)
    shared_among = models.ManyToManyField(User, on_delete=models.DO_NOTHING,related_name="shared_folders")
    privacy = models.BooleanField(default=False)
    trash = models.BooleanField(default=False)
