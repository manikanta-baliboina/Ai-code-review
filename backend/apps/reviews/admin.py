"""Admin configuration for review models."""
from __future__ import annotations

from django.contrib import admin

from .models import Review, ReviewComment


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Admin view for reviews."""

    list_display = ("pull_request", "overall_score", "created_at")
    search_fields = ("pull_request__title", "pull_request__repository__full_name")


@admin.register(ReviewComment)
class ReviewCommentAdmin(admin.ModelAdmin):
    """Admin view for review comments."""

    list_display = ("review", "file_path", "severity", "category")
    list_filter = ("severity", "category")
    search_fields = ("file_path", "message")
