"""Project routing."""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PullRequestViewSet, RepositoryViewSet

router = DefaultRouter()
router.register("repos", RepositoryViewSet, basename="repository")
router.register("prs", PullRequestViewSet, basename="pull-request")

urlpatterns = [path("", include(router.urls))]
