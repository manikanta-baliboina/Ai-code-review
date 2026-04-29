"""Serializers for authentication and users."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serialize the authenticated user."""

    class Meta:
        model = User
        fields = ("id", "email", "username", "github_username", "avatar_url")


class RegisterSerializer(serializers.Serializer):
    """Validate and create a new user account."""

    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs: dict[str, str]) -> dict[str, str]:
        """Ensure passwords match and identifiers are unique."""
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError("Username is already in use.")
        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError("Email is already in use.")
        return attrs

    def create(self, validated_data: dict[str, str]) -> User:
        """Create a new user with a hashed password."""
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
        )
