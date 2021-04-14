import boto3
from mysite.settings import AWS_STORAGE_BUCKET_NAME
from decouple import config
import os

# serves as a unique temp file name
# also used while renaming of files in PATCH for making a valid unique s3 key


class AWS_S3:
    def __init__(self):
        self.session = boto3.session.Session(aws_access_key_id=config("AWS_ACCESS_KEY_ID"),
                                             aws_secret_access_key=config("AWS_SECRET_ACCESS_KEY"))
        self.s3 = boto3.client('s3')
        self.resource = boto3.resource('s3')

    def get_cloud_storage_key(self, fileModelObject):
        return os.path.join(fileModelObject.file.storage.location, fileModelObject.file.name)

    def get_presigned_url(self, key):

        # Generate the URL to get 'key-name' from 'bucket-name'
        url = self.s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': AWS_STORAGE_BUCKET_NAME,
                'Key': key
            },
            ExpiresIn=20
        )
        return url

    def upload_file(self, file, cloud_storage_key):
        s3 = self.session.resource('s3')
        res = s3.Bucket(AWS_STORAGE_BUCKET_NAME).put_object(
            Key=cloud_storage_key, Body=file)
        return res.key

    def rename(self, old_file_key, new_file_key):
        self.copy(old_file_key, new_file_key)
        self.delete(old_file_key)

    def copy(self, old_file_key, new_file_key):

        copy_source = {
            'Bucket': AWS_STORAGE_BUCKET_NAME,
            'Key': old_file_key
        }
        bucket = self.resource.Bucket(AWS_STORAGE_BUCKET_NAME)
        bucket.copy(copy_source, new_file_key)

    def download_to(self, parent_folder_path, fileModelObject):
        name = fileModelObject.name
        cloud_storage_key = self.get_cloud_storage_key(fileModelObject)

        path_file = parent_folder_path.joinpath(name)
        self.s3.download_file(AWS_STORAGE_BUCKET_NAME,
                              cloud_storage_key, str(path_file))

    def delete(self, file_key):

        bucket = self.resource.Bucket(AWS_STORAGE_BUCKET_NAME)
        bucket.delete_objects(
            Delete={
                'Objects': [
                    {
                        'Key': file_key
                    },
                ],
            }
        )


aws_s3_object = AWS_S3()
