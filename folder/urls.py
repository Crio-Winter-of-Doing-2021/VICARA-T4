from .views import Filesystem, ShareFolder
from django.urls import path

urlpatterns = [
    path('', Filesystem.as_view(), name="filesystem"),
    path('share/', ShareFolder.as_view(), name="share-folder"),
]
