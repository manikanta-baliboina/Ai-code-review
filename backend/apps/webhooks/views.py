"""GitHub webhook handlers."""
from __future__ import annotations

import hashlib
import hmac
import json
from typing import Any

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import PullRequest, Repository
from apps.reviews.tasks import run_ai_review


class GitHubWebhookView(APIView):
    """Handle GitHub webhook events."""

    permission_classes = [permissions.AllowAny]

    def post(self, request: Any) -> Response:
        """Validate the signature and process pull request events."""
        signature = request.headers.get("X-Hub-Signature-256", "")
        raw_body = request.body
        expected = "sha256=" + hmac.new(
            settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return Response(
                {"error": "invalid_signature", "detail": "Webhook signature validation failed."},
                status=status.HTTP_403_FORBIDDEN,
            )

        event = request.headers.get("X-GitHub-Event", "")
        if event != "pull_request":
            return Response({"status": "ignored"})

        payload = json.loads(raw_body.decode("utf-8"))
        action = payload.get("action")
        if action not in {"opened", "synchronize"}:
            return Response({"status": "ignored"})

        repo_payload = payload.get("repository", {})
        repository = Repository.objects.filter(github_id=repo_payload.get("id")).select_related("owner").first()
        if not repository:
            return Response({"status": "ignored"})

        pr_payload = payload["pull_request"]
        pull_request, _ = PullRequest.objects.update_or_create(
            repository=repository,
            number=pr_payload["number"],
            defaults={
                "title": pr_payload["title"],
                "description": pr_payload.get("body") or "",
                "author": pr_payload["user"]["login"],
                "base_branch": pr_payload["base"]["ref"],
                "head_branch": pr_payload["head"]["ref"],
                "diff_url": pr_payload["diff_url"],
                "status": PullRequest.STATUS_PENDING,
                "github_url": pr_payload["html_url"],
            },
        )
        run_ai_review.delay(pull_request.id)
        return Response({"status": "accepted"})
