from .views import LoginView, Logout, Recent, Register, ListOfUsers,\
    ProfileView, Path, Favourites, Trash, SharedWithMe, RecoverFolder, RecoverFile, ProfilePicture, DownloadFolder
from django.urls import path

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name="login"),
    path('auth/register/', Register.as_view(), name="signup"),
    path('auth/logout/', Logout.as_view(), name="signup"),
    path('auth/users/', ListOfUsers.as_view(), name="users"),
    path('profile/', ProfileView.as_view(), name="profile"),
    path('profile-picture/', ProfilePicture.as_view(), name="profile-picture"),
    path('path/', Path.as_view(), name="path"),
    path('favourites/',  Favourites.as_view(), name="favourites"),
    path('recent/',  Recent.as_view(), name="recent"),
    path('trash/',  Trash.as_view(), name="trash"),
    path('shared-with-me/',  SharedWithMe.as_view(), name="shared-with-me"),
    path('recover-folder/',  RecoverFolder.as_view(), name="recover-folder"),
    path('recover-file/',  RecoverFile.as_view(), name="recover-file"),
    path('download-folder/',  DownloadFolder.as_view(), name="download-folder"),
]
