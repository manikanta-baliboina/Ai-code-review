"""Root URL configuration."""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/projects/", include("apps.projects.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/webhooks/", include("apps.webhooks.urls")),
]
