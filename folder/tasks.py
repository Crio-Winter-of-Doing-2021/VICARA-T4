from celery import shared_task
import pathlib
import shutil


@shared_task
def remove_folder(zip_dir):
    my_dir_to_delete = pathlib.Path(zip_dir)
    shutil.rmtree(my_dir_to_delete)
