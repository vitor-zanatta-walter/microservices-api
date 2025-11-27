# app/models/jwt_user.py
"""Simple dataclass representing the JWT payload after validation."""

from dataclasses import dataclass

@dataclass
class JWTUser:
    sub: str
    name: str
    email: str
    is_attendant: bool
