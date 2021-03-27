from .views import Filesystem
from django.urls import path

urlpatterns = [
    path('', Filesystem.as_view(), name="filesystem"),

]
