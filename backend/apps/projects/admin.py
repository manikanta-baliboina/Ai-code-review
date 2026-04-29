"""Admin configuration for project models."""
from __future__ import annotations

from django.contrib import admin

from .models import PullRequest, Repository


@admin.register(Repository)
class RepositoryAdmin(admin.ModelAdmin):
    """Admin view for repositories."""

    list_display = ("full_name", "owner", "is_active", "created_at")
    search_fields = ("full_name", "owner__username")


@admin.register(PullRequest)
class PullRequestAdmin(admin.ModelAdmin):
    """Admin view for pull requests."""

    list_display = ("title", "repository", "status", "created_at")
    list_filter = ("status", "repository")
    search_fields = ("title", "repository__full_name", "author")
