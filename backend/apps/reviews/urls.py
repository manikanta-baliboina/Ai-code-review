"""Review routes."""
from django.urls import path

from .views import ReviewDetailView, ReviewStatsView, TriggerReviewView

urlpatterns = [
    path("stats/", ReviewStatsView.as_view(), name="review-stats"),
    path("<int:pr_id>/", ReviewDetailView.as_view(), name="review-detail"),
    path("<int:pr_id>/trigger/", TriggerReviewView.as_view(), name="review-trigger"),
]
