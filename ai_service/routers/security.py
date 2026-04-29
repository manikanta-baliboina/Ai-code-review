"""Security router."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.claude_client import ClaudeClient

router = APIRouter(tags=["security"])
client = ClaudeClient()


class SecurityRequest(BaseModel):
    """Security scan request body."""

    diff: str = Field(min_length=1)


@router.post("/security/scan/")
async def scan_security(request: SecurityRequest) -> dict:
    """Run a security scan for the given diff."""
    try:
        return await client.scan_security(request.diff)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
