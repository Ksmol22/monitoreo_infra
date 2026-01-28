"""
Pydantic Schemas
"""
from pydantic import BaseModel, Field, IPvAnyAddress
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


# Enums
class SystemType(str):
    LINUX = "linux"
    WINDOWS = "windows"
    DATABASE = "database"


class SystemStatus(str):
    ONLINE = "online"
    OFFLINE = "offline"
    WARNING = "warning"


class LogLevel(str):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


# System Schemas
class SystemBase(BaseModel):
    """Base system schema"""
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern="^(linux|windows|database)$")
    ip_address: str
    version: Optional[str] = None
    ansible_user: str = "ansible"
    ansible_port: int = Field(default=22, ge=1, le=65535)
    ansible_connection: str = Field(default="ssh", pattern="^(ssh|winrm|psrp)$")


class SystemCreate(SystemBase):
    """Schema for creating system"""
    pass


class SystemUpdate(BaseModel):
    """Schema for updating system"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, pattern="^(linux|windows|database)$")
    ip_address: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(online|offline|warning)$")
    version: Optional[str] = None
    ansible_user: Optional[str] = None
    ansible_port: Optional[int] = Field(None, ge=1, le=65535)
    ansible_connection: Optional[str] = Field(None, pattern="^(ssh|winrm|psrp)$")


class System(SystemBase):
    """Schema for system response"""
    id: int
    status: str
    last_seen: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Metric Schemas
class MetricBase(BaseModel):
    """Base metric schema"""
    cpu_usage: Decimal = Field(..., ge=0, le=100)
    memory_usage: Decimal = Field(..., ge=0, le=100)
    disk_usage: Decimal = Field(..., ge=0, le=100)
    network_in: Decimal = Field(default=0, ge=0)
    network_out: Decimal = Field(default=0, ge=0)


class MetricCreate(MetricBase):
    """Schema for creating metric"""
    system_id: int


class Metric(MetricBase):
    """Schema for metric response"""
    id: int
    system_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


class MetricWithSystem(Metric):
    """Metric with system info"""
    system: System


# Log Schemas
class LogBase(BaseModel):
    """Base log schema"""
    level: str = Field(default="info", pattern="^(info|warning|error|critical)$")
    message: str = Field(..., min_length=1)
    source: Optional[str] = None


class LogCreate(LogBase):
    """Schema for creating log"""
    system_id: int


class Log(LogBase):
    """Schema for log response"""
    id: int
    system_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


class LogWithSystem(Log):
    """Log with system info"""
    system: System


# Dashboard Schema
class DashboardStats(BaseModel):
    """Dashboard statistics"""
    total_systems: int
    online_systems: int
    offline_systems: int
    warning_systems: int
    total_metrics: int
    total_logs: int
    recent_logs: List[LogWithSystem]


# Pagination
class PaginatedResponse(BaseModel):
    """Paginated response"""
    total: int
    page: int
    page_size: int
    data: List
