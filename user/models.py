from django.db import models
from django.contrib.auth.models import User

from django.db.models.signals import post_save
from django.dispatch import receiver

from folder.models import Folder
from file.models import File

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    root = models.OneToOneField(Folder, on_delete=models.CASCADE)

    favourite_files = models.ManyToManyField(File,on_delete=models.DO_NOTHING)
    recent_files = models.ManyToManyField(File,on_delete=models.DO_NOTHING)
    trash_files = models.ManyToManyField(File,on_delete=models.DO_NOTHING)

    favourite_folders = models.ManyToManyField(Folder,on_delete=models.DO_NOTHING)
    recent_folders = models.ManyToManyField(Folder,on_delete=models.DO_NOTHING)
    trash_folders = models.ManyToManyField(Folder,on_delete=models.DO_NOTHING)
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()