"""
Logs API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.models import Log, System
from app.schemas.schemas import Log as LogSchema, LogCreate, LogWithSystem


router = APIRouter()


@router.get("/", response_model=List[LogWithSystem])
async def get_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    system_id: Optional[int] = None,
    level: Optional[str] = None,
    hours: Optional[int] = Query(None, ge=1, le=720),
    db: AsyncSession = Depends(get_db)
):
    """Get logs with optional filtering"""
    query = select(Log).join(System)
    
    # Filter by system
    if system_id:
        query = query.filter(Log.system_id == system_id)
    
    # Filter by level
    if level:
        query = query.filter(Log.level == level)
    
    # Filter by time range
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query = query.filter(Log.timestamp >= since)
    
    # Order by timestamp descending
    query = query.order_by(desc(Log.timestamp)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Load relationships
    for log in logs:
        await db.refresh(log, ["system"])
    
    return logs


@router.get("/recent", response_model=List[LogWithSystem])
async def get_recent_logs(
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get most recent logs"""
    query = (
        select(Log)
        .order_by(desc(Log.timestamp))
        .limit(limit)
    )
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Load relationships
    for log in logs:
        await db.refresh(log, ["system"])
    
    return logs


@router.get("/{log_id}", response_model=LogSchema)
async def get_log(
    log_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get log by ID"""
    result = await db.execute(
        select(Log).filter(Log.id == log_id)
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    return log


@router.post("/", response_model=LogSchema, status_code=201)
async def create_log(
    log_data: LogCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new log"""
    # Verify system exists
    result = await db.execute(
        select(System).filter(System.id == log_data.system_id)
    )
    system = result.scalar_one_or_none()
    
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    
    # Create log
    log = Log(**log_data.model_dump())
    db.add(log)
    await db.commit()
    await db.refresh(log)
    
    return log


@router.delete("/{log_id}", status_code=204)
async def delete_log(
    log_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete log"""
    result = await db.execute(
        select(Log).filter(Log.id == log_id)
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    await db.delete(log)
    await db.commit()
    
    return None
