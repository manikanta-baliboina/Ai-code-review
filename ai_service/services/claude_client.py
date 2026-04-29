"""Anthropic client wrapper."""
from __future__ import annotations

import json
import os
from typing import Any

from anthropic import Anthropic
from dotenv import load_dotenv

from .diff_parser import parse_diff
from .prompt_builder import build_quality_prompt, build_review_prompt, build_security_prompt

load_dotenv()

MODEL_NAME = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096


class ClaudeClient:
    """Wrapper around the Anthropic SDK for structured review tasks."""

    def __init__(self) -> None:
        """Initialize the Anthropic client."""
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

    def _extract_json(self, text: str, fallback: dict[str, Any]) -> dict[str, Any]:
        """Parse JSON safely from a model response."""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return fallback

    async def _run_prompt(self, prompt: str, fallback: dict[str, Any]) -> dict[str, Any]:
        """Execute a model call and parse its JSON response."""
        response = self.client.messages.create(
            model=MODEL_NAME,
            max_tokens=MAX_TOKENS,
            system="Return only valid JSON without markdown fences.",
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text if response.content else "{}"
        return self._extract_json(text, fallback)

    async def review_code(self, diff: str, pr_title: str, pr_description: str) -> dict[str, Any]:
        """Generate a full review for a pull request diff."""
        diff_summary = parse_diff(diff)
        prompt = build_review_prompt(diff_summary, pr_title, pr_description)
        fallback = {
            "overall_score": 0.0,
            "summary": "Unable to parse model response.",
            "comments": [],
            "positive_aspects": [],
            "overall_recommendation": "comment",
        }
        return await self._run_prompt(prompt, fallback)

    async def scan_security(self, diff: str) -> dict[str, Any]:
        """Run security analysis on a diff."""
        diff_summary = parse_diff(diff)
        prompt = build_security_prompt(diff_summary)
        fallback = {"security_score": 0.0, "vulnerabilities": []}
        return await self._run_prompt(prompt, fallback)

    async def check_quality(self, diff: str) -> dict[str, Any]:
        """Run quality analysis on a diff."""
        diff_summary = parse_diff(diff)
        prompt = build_quality_prompt(diff_summary)
        fallback = {"quality_score": 0.0, "issues": []}
        return await self._run_prompt(prompt, fallback)
