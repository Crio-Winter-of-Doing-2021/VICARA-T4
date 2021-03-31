from .views import Filesystem, ShareFolder, UploadFolder, DownloadFolder
from django.urls import path

urlpatterns = [
    path('', Filesystem.as_view(), name="filesystem"),
    path('share/', ShareFolder.as_view(), name="share-folder"),
    path('upload-folder/', UploadFolder.as_view(), name="upload-folder"),

    path('download/',  DownloadFolder.as_view(), name="download-folder"),
]
