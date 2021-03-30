# Generated by Django 3.1.7 on 2021-03-30 22:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_auto_20210329_1112'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='capacity',
            field=models.IntegerField(default=100000000),
        ),
        migrations.AddField(
            model_name='profile',
            name='gender',
            field=models.CharField(choices=[('1', 'Male'), ('2', 'Female'), ('3', 'Other')], default=1, max_length=10),
            preserve_default=False,
        ),
    ]