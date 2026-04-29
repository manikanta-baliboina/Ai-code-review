"""Admin configuration for account models."""
from __future__ import annotations

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Team, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    """Admin view for custom users."""

    list_display = ("email", "github_username", "date_joined")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("GitHub", {"fields": ("github_username", "github_token", "avatar_url", "created_at")}),
    )
    readonly_fields = ("created_at",)


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """Admin view for teams."""

    list_display = ("name", "member_count", "created_by", "created_at")

    @admin.display(description="Member count")
    def member_count(self, obj: Team) -> int:
        """Return the number of team members."""
        return obj.members.count()
