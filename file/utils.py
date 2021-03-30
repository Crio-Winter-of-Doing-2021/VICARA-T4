import boto3
import secrets
import os
from mysite.settings import AWS_STORAGE_BUCKET_NAME

from .models import File


def create_file(owner, req_file, parent, req_file_name):
    new_file = File(owner=owner, file=req_file,
                    parent=parent, name=req_file_name)
    new_file.save()
    return new_file


def get_presigned_url(key):
    s3 = boto3.client('s3')
    # Generate the URL to get 'key-name' from 'bucket-name'
    url = s3.generate_presigned_url(
        ClientMethod='get_object',
        Params={
            'Bucket': AWS_STORAGE_BUCKET_NAME,
            'Key': key
        },
        ExpiresIn=20
    )
    return url


def get_s3_filename(full_filename):
    filename, file_extension = os.path.splitext(full_filename)
    random_token = secrets.token_hex(4)
    s3_filename = f"{filename}__{random_token}{file_extension}"

    return s3_filename


def rename_s3(old_file_key, new_file_key):

    s3 = boto3.resource('s3')
    copy_source = {
        'Bucket': AWS_STORAGE_BUCKET_NAME,
        'Key': old_file_key
    }
    bucket = s3.Bucket(AWS_STORAGE_BUCKET_NAME)
    print(f"{copy_source=}")
    print(f"{new_file_key}")
    bucket.copy(copy_source, new_file_key)
    bucket.delete_objects(
        Delete={
            'Objects': [
                {
                    'Key': old_file_key
                },
            ],
        }
    )
