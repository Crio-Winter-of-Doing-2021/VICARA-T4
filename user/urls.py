from .views import  LoginView, Logout, Register
from django.urls import path

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name="login"),
    path('auth/register/', Register.as_view(), name="signup"),
    path('auth/logout/', Logout.as_view(), name="signup"),

]