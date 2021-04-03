from django.urls import path, include
from .views import FileView, UploadByDriveUrl, DownloadFile

urlpatterns = [
    path('', FileView.as_view(), name='file-upload'),
    path('upload-by-url/', UploadByDriveUrl.as_view(), name="upload-by-url"),
    path('download/', DownloadFile.as_view(), name="download-file"),
]
