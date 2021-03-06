from django.db import models


class File(models.Model):
    file = models.FileField(blank=False, null=False)
    filesystem_id = models.CharField(blank=True, max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
