import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Repository",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("full_name", models.CharField(max_length=255)),
                ("github_id", models.IntegerField(unique=True)),
                ("webhook_id", models.IntegerField(null=True)),
                ("webhook_secret", models.CharField(default="", max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="repositories", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="PullRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("number", models.IntegerField()),
                ("title", models.CharField(max_length=500)),
                ("description", models.TextField(blank=True)),
                ("author", models.CharField(max_length=100)),
                ("base_branch", models.CharField(max_length=100)),
                ("head_branch", models.CharField(max_length=100)),
                ("diff_url", models.URLField()),
                ("status", models.CharField(choices=[("pending", "Pending"), ("reviewing", "Reviewing"), ("completed", "Completed"), ("failed", "Failed")], default="pending", max_length=20)),
                ("github_url", models.URLField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("repository", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="pull_requests", to="projects.repository")),
            ],
            options={
                "ordering": ("-updated_at",),
                "unique_together": {("repository", "number")},
            },
        ),
    ]
