"""
Systems API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.core.database import get_db
from app.models.models import System
from app.schemas.schemas import System as SystemSchema, SystemCreate, SystemUpdate


router = APIRouter()


@router.get("/", response_model=List[SystemSchema])
async def get_systems(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all systems with optional filtering"""
    query = select(System)
    
    # Apply filters
    if type:
        query = query.filter(System.type == type)
    if status:
        query = query.filter(System.status == status)
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    systems = result.scalars().all()
    
    return systems


@router.get("/{system_id}", response_model=SystemSchema)
async def get_system(
    system_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get system by ID"""
    result = await db.execute(
        select(System).filter(System.id == system_id)
    )
    system = result.scalar_one_or_none()
    
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    
    return system


@router.post("/", response_model=SystemSchema, status_code=201)
async def create_system(
    system_data: SystemCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create new system"""
    # Check if system with same name exists
    result = await db.execute(
        select(System).filter(System.name == system_data.name)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="System with this name already exists")
    
    # Create system
    system = System(**system_data.model_dump())
    db.add(system)
    await db.commit()
    await db.refresh(system)
    
    return system


@router.put("/{system_id}", response_model=SystemSchema)
async def update_system(
    system_id: int,
    system_data: SystemUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update system"""
    result = await db.execute(
        select(System).filter(System.id == system_id)
    )
    system = result.scalar_one_or_none()
    
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    
    # Update fields
    for field, value in system_data.model_dump(exclude_unset=True).items():
        setattr(system, field, value)
    
    await db.commit()
    await db.refresh(system)
    
    return system


@router.delete("/{system_id}", status_code=204)
async def delete_system(
    system_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete system"""
    result = await db.execute(
        select(System).filter(System.id == system_id)
    )
    system = result.scalar_one_or_none()
    
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    
    await db.delete(system)
    await db.commit()
    
    return None


@router.get("/stats/count")
async def get_systems_count(
    db: AsyncSession = Depends(get_db)
):
    """Get systems count by status"""
    result = await db.execute(
        select(
            System.status,
            func.count(System.id).label("count")
        ).group_by(System.status)
    )
    
    stats = {row.status: row.count for row in result}
    
    return {
        "total": sum(stats.values()),
        "online": stats.get("online", 0),
        "offline": stats.get("offline", 0),
        "warning": stats.get("warning", 0),
    }
