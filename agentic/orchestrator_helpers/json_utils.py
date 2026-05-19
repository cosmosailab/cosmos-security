"""JSON utilities for the orchestrator."""

import json
from datetime import datetime
from typing import Optional


class DateTimeEncoder(json.JSONEncoder):
    """JSON encoder that handles datetime objects."""

    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


def json_dumps_safe(obj, **kwargs) -> str:
    """JSON dumps with datetime support."""
    return json.dumps(obj, cls=DateTimeEncoder, **kwargs)


def normalize_content(content, response=None) -> str:
    """Extract text from LLM response content.

    ChatBedrockConverse (and some Anthropic wrappers) return content as a list
    of content blocks, e.g. [{"type": "text", "text": "..."}], instead of a
    plain string.  This normalizes both forms to a single string.

    Some reasoning models (DeepSeek R1, Qwen-thinking, etc.) put the actual
    answer in ``reasoning_content`` (or in ``type="thinking"`` blocks) while
    leaving ``content`` empty.  When *response* is provided (the full AIMessage
    object), we fall back to ``reasoning_content`` if the primary content is
    empty.
    """
    text = _extract_text(content)
    if text.strip():
        return text

    # Fallback: check reasoning_content in additional_kwargs
    if response is not None:
        kwargs = getattr(response, "additional_kwargs", None) or {}
        reasoning = kwargs.get("reasoning_content") or kwargs.get("reasoning") or ""
        if reasoning.strip():
            return reasoning

    return text


def _extract_text(content) -> str:
    """Inner helper: extract plain text from content field."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
                elif block.get("type") == "thinking":
                    parts.append(block.get("thinking", ""))
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(parts)
    return str(content)


def extract_json(response_text: str) -> Optional[str]:
    """Extract JSON from LLM response (may be wrapped in markdown)."""
    json_start = response_text.find("{")
    json_end = response_text.rfind("}") + 1

    if json_start >= 0 and json_end > json_start:
        return response_text[json_start:json_end]
    return None
