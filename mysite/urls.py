"""mysite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from django.contrib import admin
from django.urls import path, include
from user.views import CustomConvertTokenView
from django.conf.urls import url

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('user.urls')),
    path('api/folder/', include('folder.urls')),
    path('api/file/', include('file.urls')),
    path('auth/convert-token', CustomConvertTokenView.as_view(), name='token'),
    path('auth/', include('drf_social_oauth2.urls', namespace='drf')),
]


schema_view = get_schema_view(
    openapi.Info(
        title="VICARA",
        default_version='v1',
        description="https://vicara.netlify.app/",
        terms_of_service="https://vicara.netlify.app/",
        contact=openapi.Contact(email="vicara.t4@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns += [
    url(r'^swagger/$', schema_view.with_ui('swagger',
                                           cache_timeout=0), name='schema-swagger-ui'),

]
