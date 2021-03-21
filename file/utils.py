import boto3
from mysite.settings import AWS_STORAGE_BUCKET_NAME


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
