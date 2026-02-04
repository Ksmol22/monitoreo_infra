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
from app.services.ansible_service import ansible_service


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


@router.post("/ansible/", response_model=SystemSchema, status_code=201)
async def create_system_with_ansible(
    system_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Create new system and configure Ansible connection
    """
    try:
        # Extract Ansible credentials
        ansible_user = system_data.pop("ansible_user", None)
        ansible_password = system_data.pop("ansible_password", None)
        ansible_port = system_data.pop("ansible_port", 22)
        ansible_become = system_data.pop("ansible_become", None)
        
        if not ansible_user or not ansible_password:
            raise HTTPException(
                status_code=400, 
                detail="Se requieren credenciales de Ansible (ansible_user y ansible_password)"
            )
        
        # Check if system with same name exists
        result = await db.execute(
            select(System).filter(System.name == system_data.get("name"))
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(status_code=400, detail="Ya existe un sistema con este nombre")
        
        # Create system in database
        system = System(**system_data)
        db.add(system)
        await db.commit()
        await db.refresh(system)
        
        # Add to Ansible inventory
        ansible_success = await ansible_service.add_system_to_inventory(
            name=system.name,
            ip_address=system.ip_address,
            system_type=system.type,
            ansible_user=ansible_user,
            ansible_password=ansible_password,
            ansible_port=ansible_port,
            ansible_become=ansible_become
        )
        
        if not ansible_success:
            # Rollback if Ansible configuration fails
            await db.delete(system)
            await db.commit()
            raise HTTPException(
                status_code=500, 
                detail="Error al configurar Ansible para el sistema"
            )
        
        # Test connection
        connection_result = await ansible_service.test_connection(system.name)
        
        if not connection_result.get("success"):
            # Update system status to offline if connection fails
            system.status = "offline"
            await db.commit()
            await db.refresh(system)
        else:
            # Update system status to online
            system.status = "online"
            await db.commit()
            await db.refresh(system)
        
        return system
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el sistema: {str(e)}")


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
    """Delete system and remove from Ansible inventory"""
    result = await db.execute(
        select(System).filter(System.id == system_id)
    )
    system = result.scalar_one_or_none()
    
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    
    # Remove from Ansible inventory
    await ansible_service.remove_system_from_inventory(system.name, system.type)
    
    # Delete from database
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
