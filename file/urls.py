from django.urls import path, include
from .views import FileView, ShareFile, UploadByDriveUrl, StreamFile

urlpatterns = [
    path('', FileView.as_view(), name='file-upload'),
    path('share/', ShareFile.as_view(), name="share"),
    path('upload-by-url/', UploadByDriveUrl.as_view(), name="upload-by-url"),
    path('stream-file/', StreamFile.as_view(), name="stream-file"),
]
