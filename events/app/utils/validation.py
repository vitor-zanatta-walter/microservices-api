# app/utils/validation.py
"""Utility functions for manual validation of request payloads.
These replace the previous Pydantic models. Each function receives a ``dict``
representing the JSON body and returns a cleaned ``dict`` ready to be passed to
SQLAlchemy models. Validation errors raise ``ValidationError`` which the route
handlers convert to HTTP 422 responses.
"""

from datetime import datetime
from typing import Any, Dict

class ValidationError(Exception):
    """Simple exception used to signal validation problems."""
    pass

def _ensure_type(name: str, value: Any, expected_type: type) -> Any:
    if not isinstance(value, expected_type):
        raise ValidationError(f"Campo '{name}' deve ser do tipo {expected_type.__name__}")
    return value

# ---------- Event validation ----------

def validate_event_create(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate payload for creating an Event.
    Expected keys: title (str, 1-255), description (optional str),
    location (optional str, max 255), starts_at (ISO datetime str),
    ends_at (ISO datetime str).
    Returns a dict with ``datetime`` objects for the dates.
    """
    title = _ensure_type("title", data.get("title"), str)
    if not (1 <= len(title) <= 255):
        raise ValidationError("title deve ter entre 1 e 255 caracteres")

    description = data.get("description")
    if description is not None:
        description = _ensure_type("description", description, str)

    location = data.get("location")
    if location is not None:
        location = _ensure_type("location", location, str)
        if len(location) > 255:
            raise ValidationError("location pode ter no máximo 255 caracteres")

    starts_at = _ensure_type("starts_at", data.get("starts_at"), str)
    ends_at = _ensure_type("ends_at", data.get("ends_at"), str)
    try:
        starts_at_dt = datetime.fromisoformat(starts_at)
        ends_at_dt = datetime.fromisoformat(ends_at)
    except Exception as exc:
        raise ValidationError(f"datas devem estar em formato ISO8601: {exc}")

    return {
        "title": title,
        "description": description,
        "location": location,
        "starts_at": starts_at_dt,
        "ends_at": ends_at_dt,
    }

def validate_event_update(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate payload for updating an Event. All fields are optional.
    Returns a dict with only the fields that were provided (dates are converted).
    """
    out: Dict[str, Any] = {}
    if "title" in data:
        title = _ensure_type("title", data["title"], str)
        if not (1 <= len(title) <= 255):
            raise ValidationError("title deve ter entre 1 e 255 caracteres")
        out["title"] = title
    if "description" in data:
        out["description"] = _ensure_type("description", data["description"], str)
    if "location" in data:
        location = _ensure_type("location", data["location"], str)
        if len(location) > 255:
            raise ValidationError("location pode ter no máximo 255 caracteres")
        out["location"] = location
    if "starts_at" in data:
        starts_at = _ensure_type("starts_at", data["starts_at"], str)
        out["starts_at"] = datetime.fromisoformat(starts_at)
    if "ends_at" in data:
        ends_at = _ensure_type("ends_at", data["ends_at"], str)
        out["ends_at"] = datetime.fromisoformat(ends_at)
    return out

# ---------- Certificate validation ----------

def validate_certificate_create(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate payload for creating a Certificate.
    Expected keys: name (str, 1-255), description (optional str),
    hash (str, 64 hex chars).
    """
    name = _ensure_type("name", data.get("name"), str)
    if not (1 <= len(name) <= 255):
        raise ValidationError("name deve ter entre 1 e 255 caracteres")

    description = data.get("description")
    if description is not None:
        description = _ensure_type("description", description, str)

    hash_val = _ensure_type("hash", data.get("hash"), str)
    if len(hash_val) != 64:
        raise ValidationError("hash deve ter exatamente 64 caracteres hexadecimais")

    return {
        "name": name,
        "description": description,
        "hash": hash_val,
    }

def validate_certificate_update(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate payload for updating a Certificate. All fields optional."""
    out: Dict[str, Any] = {}
    if "name" in data:
        name = _ensure_type("name", data["name"], str)
        if not (1 <= len(name) <= 255):
            raise ValidationError("name deve ter entre 1 e 255 caracteres")
        out["name"] = name
    if "description" in data:
        out["description"] = _ensure_type("description", data["description"], str)
    if "hash" in data:
        hash_val = _ensure_type("hash", data["hash"], str)
        if len(hash_val) != 64:
            raise ValidationError("hash deve ter exatamente 64 caracteres hexadecimais")
        out["hash"] = hash_val
    return out
