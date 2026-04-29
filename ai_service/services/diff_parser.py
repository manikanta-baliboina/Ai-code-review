"""Utilities for parsing unified diffs."""
from __future__ import annotations

from typing import Any


def parse_diff(raw_diff: str) -> list[dict[str, Any]]:
    """Parse a unified git diff into a structured representation."""
    files: list[dict[str, Any]] = []
    current_file: dict[str, Any] | None = None
    current_hunk: dict[str, Any] | None = None

    for line in raw_diff.splitlines():
        if line.startswith("diff --git "):
            if current_hunk and current_file:
                current_file["hunks"].append(current_hunk)
            if current_file:
                files.append(current_file)
            parts = line.split(" ")
            file_path = parts[3][2:] if len(parts) > 3 else "unknown"
            current_file = {
                "file_path": file_path,
                "old_path": file_path,
                "new_path": file_path,
                "change_type": "modified",
                "binary": False,
                "additions": 0,
                "deletions": 0,
                "hunks": [],
            }
            current_hunk = None
            continue

        if current_file is None:
            continue

        if line.startswith("new file mode"):
            current_file["change_type"] = "added"
        elif line.startswith("deleted file mode"):
            current_file["change_type"] = "deleted"
        elif line.startswith("rename from "):
            current_file["old_path"] = line.replace("rename from ", "", 1)
            current_file["change_type"] = "renamed"
        elif line.startswith("rename to "):
            current_file["new_path"] = line.replace("rename to ", "", 1)
            current_file["file_path"] = current_file["new_path"]
        elif line.startswith("Binary files ") or line.startswith("GIT binary patch"):
            current_file["binary"] = True
        elif line.startswith("@@"):
            if current_hunk:
                current_file["hunks"].append(current_hunk)
            current_hunk = {"header": line, "lines": []}
        elif current_hunk is not None:
            current_hunk["lines"].append(line)
            if line.startswith("+") and not line.startswith("+++"):
                current_file["additions"] += 1
            elif line.startswith("-") and not line.startswith("---"):
                current_file["deletions"] += 1

    if current_hunk and current_file:
        current_file["hunks"].append(current_hunk)
    if current_file:
        files.append(current_file)

    return files
