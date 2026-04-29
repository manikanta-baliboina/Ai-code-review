"""Authentication views."""
from __future__ import annotations

from typing import Any

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"


def build_token_payload(user: User) -> dict[str, str]:
    """Create access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT serializer that accepts email in the username field."""

    username_field = User.USERNAME_FIELD

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """Support login via either username or email."""
        identifier = attrs.get(self.username_field, "")
        password = attrs.get("password", "")
        user = User.objects.filter(Q(username=identifier) | Q(email=identifier)).first()
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        attrs[self.username_field] = user.username
        attrs["password"] = password
        return super().validate(attrs)


class RegisterView(APIView):
    """Register a new user and return JWT tokens."""

    permission_classes = [permissions.AllowAny]

    def post(self, request: Any) -> Response:
        """Create a new user account."""
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user).data, **build_token_payload(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """Issue JWT tokens for a user."""

    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class RefreshView(TokenRefreshView):
    """Refresh JWT access tokens."""

    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """Return the currently authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Any) -> Response:
        """Return the authenticated user profile."""
        return Response(UserSerializer(request.user).data)


class GitHubOAuthView(APIView):
    """Exchange a GitHub code for a user session."""

    permission_classes = [permissions.AllowAny]

    def post(self, request: Any) -> Response:
        """Handle GitHub OAuth login."""
        code = str(request.data.get("code", "")).strip()
        if not code:
            return Response(
                {"error": "invalid_request", "detail": "GitHub OAuth code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_response = requests.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            },
            timeout=20,
        )
        token_response.raise_for_status()
        token_payload = token_response.json()
        access_token = token_payload.get("access_token")
        if not access_token:
            return Response(
                {"error": "github_oauth_failed", "detail": token_payload},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_response = requests.get(
            GITHUB_USER_URL,
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/vnd.github+json"},
            timeout=20,
        )
        user_response.raise_for_status()
        github_user = user_response.json()

        github_username = github_user.get("login", "")
        email = github_user.get("email") or f"{github_username}@users.noreply.github.com"
        username = github_username or email.split("@", maxsplit=1)[0]

        user, _ = User.objects.get_or_create(
            username=username,
            defaults={"email": email},
        )
        user.email = email
        user.github_username = github_username
        user.github_token = access_token
        user.avatar_url = github_user.get("avatar_url", "")
        user.save(update_fields=["email", "github_username", "github_token", "avatar_url"])

        return Response({"user": UserSerializer(user).data, **build_token_payload(user)})
