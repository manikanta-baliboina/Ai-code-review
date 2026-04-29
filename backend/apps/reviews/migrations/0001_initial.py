import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("projects", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Review",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("overall_score", models.FloatField()),
                ("security_score", models.FloatField()),
                ("quality_score", models.FloatField()),
                ("summary", models.TextField()),
                ("raw_response", models.JSONField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("duration_ms", models.IntegerField(default=0)),
                ("pull_request", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="review", to="projects.pullrequest")),
            ],
        ),
        migrations.CreateModel(
            name="ReviewComment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file_path", models.CharField(max_length=500)),
                ("line_start", models.IntegerField(null=True)),
                ("line_end", models.IntegerField(null=True)),
                ("severity", models.CharField(choices=[("critical", "Critical"), ("high", "High"), ("medium", "Medium"), ("low", "Low"), ("info", "Info")], max_length=20)),
                ("category", models.CharField(choices=[("bug", "Bug"), ("security", "Security"), ("performance", "Performance"), ("style", "Style"), ("best_practice", "Best Practice")], max_length=20)),
                ("message", models.TextField()),
                ("suggestion", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("review", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="comments", to="reviews.review")),
            ],
            options={
                "ordering": ("created_at",),
            },
        ),
    ]
