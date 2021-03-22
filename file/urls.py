from django.urls import path, include
from .views import FileView, Share, SharedWithMe

urlpatterns = [
    path('file/', FileView.as_view(), name='file-upload'),
    path('share/', Share.as_view(), name="share"),
    path('shared-with-me/', SharedWithMe.as_view(), name="shared-with-me"),
]
