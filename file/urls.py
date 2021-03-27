from django.urls import path, include
from .views import FileView

urlpatterns = [
    path('', FileView.as_view(), name='file-upload'),
    # path('share/', Share.as_view(), name="share"),
    # path('shared-with-me/', SharedWithMe.as_view(), name="shared-with-me"),
    # path('upload-by-url/', UploadByDriveUrl.as_view(), name="upload-by-url"),
]
