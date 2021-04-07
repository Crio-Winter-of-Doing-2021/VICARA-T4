from .views import Filesystem, UploadFolder, DownloadFolder, FolderPicker, PartialDownload
from django.urls import path

urlpatterns = [
    path('', Filesystem.as_view(), name="filesystem"),
    path('upload-folder/', UploadFolder.as_view(), name="upload-folder"),
    path('download/',  DownloadFolder.as_view(), name="download-folder"),
    path('partial-download/',  PartialDownload.as_view(), name="partial-download"),
    path('picker/',  FolderPicker.as_view(), name="picker"),
]
