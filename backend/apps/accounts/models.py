"""Account models."""
from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with GitHub integration fields."""

    github_username = models.CharField(max_length=100, blank=True)
    github_token = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        """Return a readable label for the user."""
        return self.username


class Team(models.Model):
    """A simple team for grouping users."""

    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name="teams")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_teams")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        """Return the team name."""
        return self.name
