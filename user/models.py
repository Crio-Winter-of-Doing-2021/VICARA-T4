from django.db import models
from django.contrib.auth.models import User

from django.db.models.signals import post_save
from django.dispatch import receiver

from folder.models import Folder


class ProfileManager(models.Manager):
    def get_or_none(self, **kwargs):
        try:
            return Profile.objects.get(**kwargs)
        except:
            return None


default_profile_picture_url = "https://www.flaticon.com/svg/static/icons/svg/847/847969.svg"


class Profile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile")
    root = models.OneToOneField(Folder, on_delete=models.CASCADE, null=True)
    storage_avail = models.IntegerField(default=100000000)
    storage_used = models.IntegerField(default=0)
    gender = models.SmallIntegerField(default=4)
    profile_picture_url = models.TextField(
        default=default_profile_picture_url, max_length=300)
    objects = models.Manager()
    custom_objects = ProfileManager()

    def __str__(self):
        return f"{self.user.username} | email = {self.user.email}"

    def get_full_name(self):
        return f"{self.user.first_name} {self.user.last_name}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
