"""
Router principal da API
"""
from fastapi import APIRouter
from app.api.routes import events, certificates

api_router = APIRouter()

api_router.include_router(events.router)
api_router.include_router(certificates.router)
