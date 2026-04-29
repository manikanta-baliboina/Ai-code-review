"""Review execution helpers."""
from __future__ import annotations

import logging
from typing import Any

import requests
from django.conf import settings
from django.db import transaction

from apps.projects.models import PullRequest

from .models import Review, ReviewComment

logger = logging.getLogger(__name__)


def post_json(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    """Send a JSON request and return a parsed response."""
    response = requests.post(url, json=payload, timeout=120)
    response.raise_for_status()
    return response.json()


def run_ai_review(pr_id: int) -> dict[str, Any]:
    """Run AI review workflows for a pull request synchronously."""
    try:
        pull_request = PullRequest.objects.select_related("repository").get(pk=pr_id)
        pull_request.status = PullRequest.STATUS_REVIEWING
        pull_request.save(update_fields=["status", "updated_at"])

        diff_response = requests.get(pull_request.diff_url, timeout=60)
        diff_response.raise_for_status()
        diff = diff_response.text

        review_result = post_json(
            f"{settings.AI_SERVICE_URL}/review/",
            {
                "diff": diff,
                "pr_title": pull_request.title,
                "pr_description": pull_request.description,
            },
        )
        security_result = post_json(f"{settings.AI_SERVICE_URL}/security/scan/", {"diff": diff})
        quality_result = post_json(f"{settings.AI_SERVICE_URL}/quality/check/", {"diff": diff})

        with transaction.atomic():
            review, _ = Review.objects.update_or_create(
                pull_request=pull_request,
                defaults={
                    "overall_score": float(review_result.get("overall_score", 0.0)),
                    "security_score": float(security_result.get("security_score", 0.0)),
                    "quality_score": float(quality_result.get("quality_score", 0.0)),
                    "summary": str(review_result.get("summary", "")),
                    "duration_ms": int(review_result.get("duration_ms", 0)),
                    "raw_response": {
                        "review": review_result,
                        "security": security_result,
                        "quality": quality_result,
                    },
                },
            )
            review.comments.all().delete()
            for comment in review_result.get("comments", []):
                ReviewComment.objects.create(
                    review=review,
                    file_path=str(comment.get("file_path", "")),
                    line_start=comment.get("line_start"),
                    line_end=comment.get("line_end"),
                    severity=str(comment.get("severity", "info")),
                    category=str(comment.get("category", "best_practice")),
                    message=str(comment.get("message", "")),
                    suggestion=str(comment.get("suggestion", "")),
                )

        pull_request.status = PullRequest.STATUS_COMPLETED
        pull_request.save(update_fields=["status", "updated_at"])
        return {"status": "completed", "pull_request_id": pr_id}
    except Exception as exc:
        logger.exception("AI review failed for PR %s", pr_id)
        PullRequest.objects.filter(pk=pr_id).update(status=PullRequest.STATUS_FAILED)
        return {"status": "failed", "pull_request_id": pr_id, "error": str(exc)}
