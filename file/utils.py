import secrets
import os
from .models import File

from folder.utils import propagate_size_change
from mysite.cloud_storage_providers import aws_s3_object as CLOUD_STORAGE_PROVIDER


def create_file(owner, req_file, parent, req_file_name, size):
    new_file = File(owner=owner, file=req_file,
                    parent=parent, name=req_file_name,
                    size=size, privacy=parent.privacy)
    new_file.save()
    new_file.shared_among.set(parent.shared_among.all())
    new_file.present_in_shared_me_of.set(parent.present_in_shared_me_of.all())
    new_file.save()
    propagate_size_change(new_file.parent, new_file.size)
    return new_file


def get_cloud_filename(full_filename):
    filename, file_extension = os.path.splitext(full_filename)
    random_token = secrets.token_hex(4)
    cloud_filename = f"{filename}__{random_token}{file_extension}"

    return cloud_filename


def get_presigned_url(key):
    return CLOUD_STORAGE_PROVIDER.get_presigned_url(key)


def copy_s3(old_file_key, new_file_key):
    CLOUD_STORAGE_PROVIDER.copy(old_file_key, new_file_key)


def delete_s3(file_key):
    CLOUD_STORAGE_PROVIDER.delete(file_key)


def upload_file_to_s3(file, cloud_storage_key):
    return CLOUD_STORAGE_PROVIDER.upload_file(file, cloud_storage_key)


def rename_s3(old_file_key, new_file_key):
    return CLOUD_STORAGE_PROVIDER.rename(old_file_key, new_file_key)
