# Generated by Django 3.1.2 on 2021-03-15 16:08

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('file', '0006_file_year_in_school'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='users',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
    ]