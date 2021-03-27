from .views import LoginView, Logout, Register, ListOfUsers, ProfileView, Path
from django.urls import path

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name="login"),
    path('auth/register/', Register.as_view(), name="signup"),
    path('auth/logout/', Logout.as_view(), name="signup"),
    path('auth/users/', ListOfUsers.as_view(), name="users"),
    path('profile/', ProfileView.as_view(), name="profile"),
    path('path/', Path.as_view(), name="path"),
]
