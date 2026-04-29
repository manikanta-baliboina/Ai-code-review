"""Review models."""
from __future__ import annotations

from django.db import models

from apps.projects.models import PullRequest


class Review(models.Model):
    """Top-level AI review record."""

    pull_request = models.OneToOneField(PullRequest, on_delete=models.CASCADE, related_name="review")
    overall_score = models.FloatField()
    security_score = models.FloatField()
    quality_score = models.FloatField()
    summary = models.TextField()
    raw_response = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    duration_ms = models.IntegerField(default=0)

    def __str__(self) -> str:
        """Return the review identifier."""
        return f"Review for {self.pull_request}"


class ReviewComment(models.Model):
    """A file- and line-specific AI review comment."""

    SEVERITY_CHOICES = (
        ("critical", "Critical"),
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
        ("info", "Info"),
    )
    CATEGORY_CHOICES = (
        ("bug", "Bug"),
        ("security", "Security"),
        ("performance", "Performance"),
        ("style", "Style"),
        ("best_practice", "Best Practice"),
    )

    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="comments")
    file_path = models.CharField(max_length=500)
    line_start = models.IntegerField(null=True)
    line_end = models.IntegerField(null=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    message = models.TextField()
    suggestion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        """Return a readable comment label."""
        return f"{self.file_path}:{self.line_start or '-'}"
