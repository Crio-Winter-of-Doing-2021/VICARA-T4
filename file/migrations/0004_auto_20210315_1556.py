# Generated by Django 3.1.2 on 2021-03-15 15:56

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('file', '0003_auto_20210307_0901'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='creator',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='creator', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='file',
            name='users',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='users', to=settings.AUTH_USER_MODEL),
        ),
    ]