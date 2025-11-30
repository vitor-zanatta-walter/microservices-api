from dataclasses import dataclass

@dataclass
class JWTUser:
    sub: str
    name: str
    email: str
    is_attendant: bool
