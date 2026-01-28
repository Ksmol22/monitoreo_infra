"""
Dashboard API Endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.database import get_db
from app.models.models import System, Metric, Log
from app.schemas.schemas import DashboardStats


router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics"""
    
    # Count systems by status
    systems_result = await db.execute(
        select(
            System.status,
            func.count(System.id).label("count")
        ).group_by(System.status)
    )
    systems_by_status = {row.status: row.count for row in systems_result}
    
    # Count total systems
    total_systems_result = await db.execute(
        select(func.count(System.id))
    )
    total_systems = total_systems_result.scalar()
    
    # Count total metrics
    total_metrics_result = await db.execute(
        select(func.count(Metric.id))
    )
    total_metrics = total_metrics_result.scalar()
    
    # Count total logs
    total_logs_result = await db.execute(
        select(func.count(Log.id))
    )
    total_logs = total_logs_result.scalar()
    
    # Get recent logs (last 10)
    recent_logs_result = await db.execute(
        select(Log)
        .order_by(desc(Log.timestamp))
        .limit(10)
    )
    recent_logs = recent_logs_result.scalars().all()
    
    # Load system relationships for logs
    for log in recent_logs:
        await db.refresh(log, ["system"])
    
    return DashboardStats(
        total_systems=total_systems or 0,
        online_systems=systems_by_status.get("online", 0),
        offline_systems=systems_by_status.get("offline", 0),
        warning_systems=systems_by_status.get("warning", 0),
        total_metrics=total_metrics or 0,
        total_logs=total_logs or 0,
        recent_logs=recent_logs
    )
