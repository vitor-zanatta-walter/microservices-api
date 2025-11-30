# Utilitários para autenticação e validação de JWT
import jwt
from pathlib import Path
from typing import Optional
from flask import request, g, abort
from app.models.jwt_user import JWTUser

PUBLIC_KEY_PATH = Path(__file__).parent.parent.parent / "keys" / "public.pem"


def load_public_key() -> str:
    # Carrega a chave pública RSA
    try:
        with open(PUBLIC_KEY_PATH, "r") as f:
            return f.read()
    except FileNotFoundError:
        raise RuntimeError(f"Chave pública não encontrada em: {PUBLIC_KEY_PATH}")


def decode_jwt_token(token: str) -> JWTUser:
    # Decodifica e valida um token JWT usando RS256
    try:
        public_key = load_public_key()
        payload = jwt.decode(token, public_key, algorithms=["RS256"])
        
        # Validar campos obrigatórios
        required = ["sub", "name", "email", "is_attendant"]
        missing = [f for f in required if f not in payload]
        if missing:
            abort(401, description=f"Campos faltando: {', '.join(missing)}")
        
        return JWTUser(
            sub=payload["sub"],
            name=payload["name"],
            email=payload["email"],
            is_attendant=payload["is_attendant"]
        )
    except jwt.ExpiredSignatureError:
        abort(401, description="Token expirado")
    except jwt.InvalidTokenError as e:
        abort(401, description=f"Token inválido: {str(e)}")


def extract_token_from_header(authorization: Optional[str]) -> str:
    # Extrai o token do header Authorization
    if not authorization:
        abort(401, description="Header Authorization ausente")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        abort(401, description="Formato inválido. Use: Bearer <token>")
    
    return parts[1]


def get_current_user() -> JWTUser:
    # Retorna o usuário autenticado do flask.g
    if 'user' not in g:
        abort(401, description="Usuário não autenticado")
    return g.user


def require_attendant(f):
    # Decorator to require attendant privileges
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user.is_attendant:
            abort(403, description="Acesso restrito a atendentes")
        return f(*args, **kwargs)
    return decorated_function
