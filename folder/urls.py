from .views import Filesystem, UploadFolder, DownloadFolder
from django.urls import path

urlpatterns = [
    path('', Filesystem.as_view(), name="filesystem"),
    path('upload-folder/', UploadFolder.as_view(), name="upload-folder"),

    path('download/',  DownloadFolder.as_view(), name="download-folder"),
]
