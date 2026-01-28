"""
API v1 Router
"""
from fastapi import APIRouter

from app.api.v1.endpoints import systems, metrics, logs, dashboard


api_router = APIRouter()

# Include endpoint routers
api_router.include_router(systems.router, prefix="/systems", tags=["Systems"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(logs.router, prefix="/logs", tags=["Logs"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
