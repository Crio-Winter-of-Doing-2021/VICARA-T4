from .views import LoginView, Logout, Register, ListOfUsers
from django.urls import path

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name="login"),
    path('auth/register/', Register.as_view(), name="signup"),
    path('auth/logout/', Logout.as_view(), name="signup"),
    path('auth/users/', ListOfUsers.as_view(), name="users"),
]
