"""Serializers for reviews."""
from __future__ import annotations

from rest_framework import serializers

from .models import Review, ReviewComment


class ReviewCommentSerializer(serializers.ModelSerializer):
    """Serialize comment-level review data."""

    class Meta:
        model = ReviewComment
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    """Serialize review data with nested comments."""

    comments = ReviewCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = "__all__"
