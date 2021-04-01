from celery import shared_task
import os


@shared_task
def remove_file(file_path):
    os.remove(str(file_path))
