"""Review router."""
from __future__ import annotations

import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.claude_client import ClaudeClient

router = APIRouter(tags=["review"])
client = ClaudeClient()


class ReviewRequest(BaseModel):
    """Review request body."""

    diff: str = Field(min_length=1)
    pr_title: str = Field(default="")
    pr_description: str = Field(default="")


@router.post("/review/")
async def review_code(request: ReviewRequest) -> dict:
    """Run a full code review against the provided diff."""
    started = time.perf_counter()
    try:
        result = await client.review_code(request.diff, request.pr_title, request.pr_description)
        result["duration_ms"] = int((time.perf_counter() - started) * 1000)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
