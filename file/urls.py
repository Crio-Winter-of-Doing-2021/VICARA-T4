from django.urls import path, include
from .views import FileView, Share

urlpatterns = [
    path('file/', FileView.as_view(), name='file-upload'),
    path('share/', Share.as_view(), name="share")
]
