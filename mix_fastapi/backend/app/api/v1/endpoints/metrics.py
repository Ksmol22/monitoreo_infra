"""
Metrics API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.models import Metric, System
from app.schemas.schemas import Metric as MetricSchema, MetricCreate, MetricWithSystem


router = APIRouter()


@router.get("/", response_model=List[MetricWithSystem])
async def get_metrics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    system_id: Optional[int] = None,
    hours: Optional[int] = Query(None, ge=1, le=720),  # Last N hours
    db: AsyncSession = Depends(get_db)
):
    """Get metrics with optional filtering"""
    query = select(Metric).join(System)
    
    # Filter by system
    if system_id:
        query = query.filter(Metric.system_id == system_id)
    
    # Filter by time range
    if hours:
        since = datetime.utcnow() - timedelta(hours=hours)
        query = query.filter(Metric.timestamp >= since)
    
    # Order by timestamp descending
    query = query.order_by(desc(Metric.timestamp)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    metrics = result.scalars().all()
    
    # Load relationships
    for metric in metrics:
        await db.refresh(metric, ["system"])
    
    return metrics


@router.get("/latest", response_model=List[MetricWithSystem])
async def get_latest_metrics(
    db: AsyncSession = Depends(get_db)
):
    """Get latest metric for each system"""
    # Subquery to get max timestamp per system
    subquery = (
        select(
            Metric.system_id,
            func.max(Metric.timestamp).label("max_timestamp")
        )
        .group_by(Metric.system_id)
        .subquery()
    )
    
    # Join to get full metric records
    query = (
        select(Metric)
        .join(
            subquery,
            (Metric.system_id == subquery.c.system_id) &
            (Metric.timestamp == subquery.c.max_timestamp)
        )
    )
    
    result = await db.execute(query)
    metrics = result.scalars().all()
    
    # Load relationships
    for metric in metrics:
        await db.refresh(metric, ["system"])
    
    return metrics


@router.get("/{metric_id}", response_model=MetricSchema)
async def get_metric(
    metric_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get metric by ID"""
    result = await db.execute(
        select(Metric).filter(Metric.id == metric_id)
    )
    metric = result.scalar_one_or_none()
    
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    return metric


@router.post("/", response_model=MetricSchema, status_code=201)
async def create_metric(
    metric_data: MetricCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new metric"""
    # Verify system exists
    result = await db.execute(
        select(System).filter(System.id == metric_data.system_id)
    )
    system = result.scalar_one_or_none()
    
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    
    # Create metric
    metric = Metric(**metric_data.model_dump())
    db.add(metric)
    
    # Update system last_seen and status
    system.last_seen = datetime.utcnow()
    system.status = "online"
    
    await db.commit()
    await db.refresh(metric)
    
    return metric


@router.post("/bulk", response_model=List[MetricSchema], status_code=201)
async def create_metrics_bulk(
    metrics_data: List[MetricCreate],
    db: AsyncSession = Depends(get_db)
):
    """Create multiple metrics at once"""
    metrics = [Metric(**data.model_dump()) for data in metrics_data]
    
    db.add_all(metrics)
    await db.commit()
    
    for metric in metrics:
        await db.refresh(metric)
    
    return metrics


@router.delete("/{metric_id}", status_code=204)
async def delete_metric(
    metric_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete metric"""
    result = await db.execute(
        select(Metric).filter(Metric.id == metric_id)
    )
    metric = result.scalar_one_or_none()
    
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    await db.delete(metric)
    await db.commit()
    
    return None
