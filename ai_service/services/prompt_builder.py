"""Prompt construction helpers."""
from __future__ import annotations

import json
from typing import Any


def _serialize_diff(diff_summary: list[dict[str, Any]]) -> str:
    """Create a readable diff summary for prompting."""
    return json.dumps(diff_summary, indent=2)


def build_review_prompt(diff_summary: list[dict[str, Any]], pr_title: str, pr_description: str) -> str:
    """Build the main review prompt for Claude."""
    schema = {
        "overall_score": 8.5,
        "summary": "Brief executive summary of the PR",
        "comments": [
            {
                "file_path": "src/auth.py",
                "line_start": 45,
                "line_end": 47,
                "severity": "critical|high|medium|low|info",
                "category": "bug|security|performance|style|best_practice",
                "message": "Clear description of the issue",
                "suggestion": "Concrete code fix or improvement suggestion",
            }
        ],
        "positive_aspects": ["List of things done well"],
        "overall_recommendation": "approve|request_changes|comment",
    }
    return (
        "You are an expert senior software engineer performing code review.\n"
        "Analyze the pull request diff carefully and focus on correctness, security, maintainability, "
        "performance, and engineering best practices.\n"
        "Respond ONLY with valid JSON matching this exact schema:\n"
        f"{json.dumps(schema, indent=2)}\n\n"
        f"Pull Request Title:\n{pr_title}\n\n"
        f"Pull Request Description:\n{pr_description}\n\n"
        f"Parsed Diff Summary:\n{_serialize_diff(diff_summary)}"
    )


def build_security_prompt(diff_summary: list[dict[str, Any]]) -> str:
    """Build a security-focused analysis prompt."""
    schema = {"security_score": 9.0, "vulnerabilities": []}
    return (
        "You are a senior application security reviewer.\n"
        "Inspect the diff for OWASP Top 10 issues, injection risks, insecure deserialization, "
        "hardcoded secrets, privilege escalation, and broken authentication patterns.\n"
        "Respond ONLY with valid JSON matching this schema:\n"
        f"{json.dumps(schema, indent=2)}\n\n"
        f"Parsed Diff Summary:\n{_serialize_diff(diff_summary)}"
    )


def build_quality_prompt(diff_summary: list[dict[str, Any]]) -> str:
    """Build a quality-focused analysis prompt."""
    schema = {"quality_score": 7.5, "issues": []}
    return (
        "You are a principal engineer reviewing code quality.\n"
        "Inspect the diff for cyclomatic complexity, DRY violations, missing error handling, naming "
        "issues, maintainability concerns, and missing tests.\n"
        "Respond ONLY with valid JSON matching this schema:\n"
        f"{json.dumps(schema, indent=2)}\n\n"
        f"Parsed Diff Summary:\n{_serialize_diff(diff_summary)}"
    )
