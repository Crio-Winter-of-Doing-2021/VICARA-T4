from django.db import models


class File(models.Model):
    file = models.FileField(blank=False, null=False)
    filesystem_id = models.CharField(blank=True, max_length=200)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filesystem_id} @ {self.timestamp}"
