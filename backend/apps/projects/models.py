"""Project and pull request models."""
from __future__ import annotations

import secrets

from django.conf import settings
from django.db import models


class Repository(models.Model):
    """A GitHub repository connected by a user."""

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="repositories")
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    github_id = models.IntegerField(unique=True)
    webhook_id = models.IntegerField(null=True)
    webhook_secret = models.CharField(max_length=255, default=secrets.token_urlsafe)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        """Return the repository full name."""
        return self.full_name


class PullRequest(models.Model):
    """A pull request that can be reviewed by the AI service."""

    STATUS_PENDING = "pending"
    STATUS_REVIEWING = "reviewing"
    STATUS_COMPLETED = "completed"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_REVIEWING, "Reviewing"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_FAILED, "Failed"),
    )

    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name="pull_requests")
    number = models.IntegerField()
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    author = models.CharField(max_length=100)
    base_branch = models.CharField(max_length=100)
    head_branch = models.CharField(max_length=100)
    diff_url = models.URLField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    github_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("repository", "number")
        ordering = ("-updated_at",)

    def __str__(self) -> str:
        """Return a readable pull request label."""
        return f"{self.repository.full_name}#{self.number}"
