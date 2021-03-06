from django.urls import path, include
from .views import FileView

urlpatterns = [
    path('', FileView.as_view(), name='file-upload'),
]
