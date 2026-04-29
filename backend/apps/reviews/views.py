"""Review endpoints."""
from __future__ import annotations

from datetime import timedelta
from typing import Any

from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import PullRequest

from .models import ReviewComment
from .serializers import ReviewSerializer
from .tasks import run_ai_review


class ReviewDetailView(APIView):
    """Return the review for a specific pull request."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Any, pr_id: int) -> Response:
        """Fetch a review record."""
        pull_request = (
            PullRequest.objects.filter(pk=pr_id, repository__owner=request.user)
            .select_related("review", "review__pull_request")
            .prefetch_related("review__comments")
            .first()
        )
        if not pull_request or not hasattr(pull_request, "review"):
            return Response(
                {"error": "not_found", "detail": "Review not found for this pull request."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ReviewSerializer(pull_request.review).data)


class TriggerReviewView(APIView):
    """Queue an AI review for a pull request."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request: Any, pr_id: int) -> Response:
        """Dispatch the Celery task."""
        pull_request = PullRequest.objects.filter(pk=pr_id, repository__owner=request.user).first()
        if not pull_request:
            return Response(
                {"error": "not_found", "detail": "Pull request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        task = run_ai_review.delay(pull_request.id)
        return Response({"status": "queued", "task_id": task.id}, status=status.HTTP_202_ACCEPTED)


class ReviewStatsView(APIView):
    """Return dashboard metrics for the authenticated user."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Any) -> Response:
        """Build dashboard statistics and trend data."""
        review_queryset = (
            PullRequest.objects.filter(repository__owner=request.user, review__isnull=False)
            .select_related("review")
            .prefetch_related("review__comments")
        )
        total_prs = PullRequest.objects.filter(repository__owner=request.user).count()
        total_reviews = review_queryset.count()
        avg_score = review_queryset.aggregate(avg=Avg("review__overall_score"))["avg"] or 0.0
        critical_issues_count = ReviewComment.objects.filter(
            review__pull_request__repository__owner=request.user,
            severity="critical",
        ).count()
        week_start = timezone.now() - timedelta(days=7)
        reviews_this_week = review_queryset.filter(review__created_at__gte=week_start).count()

        daily = (
            review_queryset.filter(review__created_at__gte=week_start)
            .annotate(day=TruncDate("review__created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        recent_reviews = review_queryset.order_by("-review__created_at")[:5]

        return Response(
            {
                "total_prs": total_prs,
                "total_reviews": total_reviews,
                "avg_score": round(avg_score, 2),
                "critical_issues_count": critical_issues_count,
                "reviews_this_week": reviews_this_week,
                "reviews_by_day": [
                    {"date": item["day"].isoformat(), "count": item["count"]} for item in daily
                ],
                "recent_reviews": [
                    {
                        "id": pr.id,
                        "title": pr.title,
                        "score": pr.review.overall_score,
                        "date": pr.review.created_at.isoformat(),
                    }
                    for pr in recent_reviews
                ],
            }
        )
