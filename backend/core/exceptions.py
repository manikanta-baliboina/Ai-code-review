"""Custom API exception handling."""
from __future__ import annotations

from typing import Any

from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc: Exception, context: dict[str, Any]) -> Response | None:
    """Return a consistent API error format."""
    response = exception_handler(exc, context)
    if response is None:
        return Response({"error": "server_error", "detail": str(exc)}, status=500)

    detail = response.data
    if isinstance(detail, dict):
        error_message = detail.get("detail") or detail.get("error") or "request_error"
    else:
        error_message = "request_error"

    response.data = {"error": error_message, "detail": detail}
    return response
