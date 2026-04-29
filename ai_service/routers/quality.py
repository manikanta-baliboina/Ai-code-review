"""Quality router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.claude_client import ClaudeClient

router = APIRouter(tags=["quality"])
client = ClaudeClient()


class QualityRequest(BaseModel):
    """Quality check request body."""

    diff: str = Field(min_length=1)


@router.post("/quality/check/")
async def check_quality(request: QualityRequest) -> dict:
    """Run a quality check for the given diff."""
    try:
        return await client.check_quality(request.diff)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
