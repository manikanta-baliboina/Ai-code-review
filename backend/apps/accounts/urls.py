"""Authentication URL routes."""
from django.urls import path

from .views import GitHubOAuthView, LoginView, MeView, RefreshView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("github/", GitHubOAuthView.as_view(), name="github-oauth"),
]
