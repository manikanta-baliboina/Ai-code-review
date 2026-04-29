"""Views for repositories and pull requests."""
from __future__ import annotations

from typing import Any

import requests
from django.conf import settings
from django.db.models import Count, Exists, OuterRef
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.reviews.models import Review

from .models import PullRequest, Repository
from .serializers import PullRequestSerializer, RepositorySerializer

GITHUB_API_BASE = "https://api.github.com"


class RepositoryViewSet(viewsets.ModelViewSet):
    """Manage connected repositories for the current user."""

    serializer_class = RepositorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return repositories belonging to the authenticated user."""
        return (
            Repository.objects.filter(owner=self.request.user)
            .annotate(pull_request_count=Count("pull_requests"))
            .select_related("owner")
        )

    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Connect a repository and register a webhook."""
        full_name = str(request.data.get("full_name", "")).strip()
        if "/" not in full_name:
            return Response(
                {"error": "invalid_repository", "detail": "Repository full name must be in owner/repo format."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not request.user.github_token:
            return Response(
                {"error": "github_not_connected", "detail": "Connect your GitHub account before adding repositories."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        owner_name, repo_name = full_name.split("/", maxsplit=1)
        headers = {
            "Authorization": f"Bearer {request.user.github_token}",
            "Accept": "application/vnd.github+json",
        }
        repo_response = requests.get(f"{GITHUB_API_BASE}/repos/{full_name}", headers=headers, timeout=20)
        repo_response.raise_for_status()
        repo_data = repo_response.json()

        webhook_secret = settings.GITHUB_WEBHOOK_SECRET
        webhook_payload = {
            "name": "web",
            "active": True,
            "events": ["pull_request"],
            "config": {
                "url": f"{settings.BACKEND_PUBLIC_URL.rstrip('/')}/api/webhooks/github/",
                "content_type": "json",
                "secret": webhook_secret,
            },
        }
        webhook_response = requests.post(
            f"{GITHUB_API_BASE}/repos/{full_name}/hooks",
            headers=headers,
            json=webhook_payload,
            timeout=20,
        )
        webhook_response.raise_for_status()
        webhook_data = webhook_response.json()

        repository, _ = Repository.objects.update_or_create(
            github_id=repo_data["id"],
            defaults={
                "owner": request.user,
                "name": repo_name,
                "full_name": f"{owner_name}/{repo_name}",
                "webhook_id": webhook_data["id"],
                "webhook_secret": webhook_secret,
                "is_active": True,
            },
        )
        serializer = self.get_serializer(repository)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Disconnect a repository and remove its webhook."""
        instance = self.get_object()
        if instance.webhook_id and request.user.github_token:
            headers = {
                "Authorization": f"Bearer {request.user.github_token}",
                "Accept": "application/vnd.github+json",
            }
            requests.delete(
                f"{GITHUB_API_BASE}/repos/{instance.full_name}/hooks/{instance.webhook_id}",
                headers=headers,
                timeout=20,
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def sync_prs(self, request: Request, pk: str | None = None) -> Response:
        """Sync open pull requests from GitHub into the local database."""
        repository = self.get_object()
        headers = {
            "Authorization": f"Bearer {request.user.github_token}",
            "Accept": "application/vnd.github+json",
        }
        response = requests.get(
            f"{GITHUB_API_BASE}/repos/{repository.full_name}/pulls?state=open",
            headers=headers,
            timeout=20,
        )
        response.raise_for_status()
        synced = 0
        for item in response.json():
            PullRequest.objects.update_or_create(
                repository=repository,
                number=item["number"],
                defaults={
                    "title": item["title"],
                    "description": item.get("body") or "",
                    "author": item["user"]["login"],
                    "base_branch": item["base"]["ref"],
                    "head_branch": item["head"]["ref"],
                    "diff_url": item["diff_url"],
                    "status": PullRequest.STATUS_PENDING,
                    "github_url": item["html_url"],
                },
            )
            synced += 1
        return Response({"synced_count": synced})


class PullRequestViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to pull requests for the current user."""

    serializer_class = PullRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return pull requests with optimized related data."""
        queryset = (
            PullRequest.objects.filter(repository__owner=self.request.user)
            .select_related("repository", "review")
            .prefetch_related("review__comments")
            .annotate(has_review=Exists(Review.objects.filter(pull_request=OuterRef("pk"))))
        )
        repo_id = self.request.query_params.get("repo")
        status_filter = self.request.query_params.get("status")
        if repo_id:
            queryset = queryset.filter(repository_id=repo_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """Return PR detail along with the raw diff content."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        payload = serializer.data
        try:
            diff_response = requests.get(instance.diff_url, timeout=20)
            diff_response.raise_for_status()
            payload["diff_content"] = diff_response.text
        except requests.RequestException:
            payload["diff_content"] = ""
        return Response(payload)
