"""Serializers for repositories and pull requests."""
from __future__ import annotations

from rest_framework import serializers

from apps.reviews.serializers import ReviewSerializer

from .models import PullRequest, Repository


class RepositorySerializer(serializers.ModelSerializer):
    """Serialize repository data."""

    pull_request_count = serializers.IntegerField(read_only=True)
    last_sync_date = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Repository
        fields = "__all__"
        read_only_fields = ("owner", "webhook_id", "webhook_secret", "created_at")


class PullRequestSerializer(serializers.ModelSerializer):
    """Serialize pull request data."""

    has_review = serializers.BooleanField(read_only=True)
    review = ReviewSerializer(read_only=True)
    score = serializers.FloatField(source="review.overall_score", read_only=True)
    diff_content = serializers.CharField(read_only=True)

    class Meta:
        model = PullRequest
        fields = "__all__"
