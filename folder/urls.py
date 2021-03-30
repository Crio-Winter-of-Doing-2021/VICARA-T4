from .views import Filesystem, ShareFolder, UploadFolder
from django.urls import path

urlpatterns = [
    path('', Filesystem.as_view(), name="filesystem"),
    path('share/', ShareFolder.as_view(), name="share-folder"),
    path('upload-folder/', UploadFolder.as_view(), name="upload-folder"),
]
