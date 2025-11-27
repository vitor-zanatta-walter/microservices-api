# Middleware de autenticação JWT
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.auth.jwt_utils import extract_token_from_header, decode_jwt_token

# Rotas que não precisam de autenticação
EXEMPT_ROUTES = ["/", "/ping", "/health", "/docs", "/redoc", "/openapi.json"]


class JWTAuthMiddleware(BaseHTTPMiddleware):
    
    async def dispatch(self, request: Request, call_next):
        
        # Verificar se a rota está isenta
        if request.url.path in EXEMPT_ROUTES:
            return await call_next(request)
        
        try:
            # Extrair e validar token
            authorization = request.headers.get("Authorization")
            token = extract_token_from_header(authorization)
            user_data = decode_jwt_token(token)
            
            # Adicionar usuário ao request.state
            request.state.user = user_data
            
            return await call_next(request)
        except HTTPException as e:
            raise e
