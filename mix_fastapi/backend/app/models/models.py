"""
SQLAlchemy Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base


class SystemType(str, enum.Enum):
    """System type enum"""
    LINUX = "linux"
    WINDOWS = "windows"
    DATABASE = "database"


class SystemStatus(str, enum.Enum):
    """System status enum"""
    ONLINE = "online"
    OFFLINE = "offline"
    WARNING = "warning"


class LogLevel(str, enum.Enum):
    """Log level enum"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class System(Base):
    """System model"""
    __tablename__ = "systems"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(Enum(SystemType), nullable=False, index=True)
    ip_address = Column(String(45), nullable=False)
    status = Column(Enum(SystemStatus), default=SystemStatus.OFFLINE, index=True)
    version = Column(String(100), nullable=True)
    last_seen = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Ansible configuration
    ansible_user = Column(String(100), default="ansible")
    ansible_port = Column(Integer, default=22)
    ansible_connection = Column(String(50), default="ssh")  # ssh, winrm, psrp
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    metrics = relationship("Metric", back_populates="system", cascade="all, delete-orphan")
    logs = relationship("Log", back_populates="system", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<System(id={self.id}, name='{self.name}', type='{self.type}', status='{self.status}')>"


class Metric(Base):
    """Metric model"""
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(Integer, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Performance metrics
    cpu_usage = Column(Numeric(5, 2), nullable=False)  # Percentage
    memory_usage = Column(Numeric(5, 2), nullable=False)  # Percentage
    disk_usage = Column(Numeric(5, 2), nullable=False)  # Percentage
    network_in = Column(Numeric(15, 2), default=0)  # KB
    network_out = Column(Numeric(15, 2), default=0)  # KB
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationship
    system = relationship("System", back_populates="metrics")
    
    def __repr__(self):
        return f"<Metric(id={self.id}, system_id={self.system_id}, cpu={self.cpu_usage}%)>"


class Log(Base):
    """Log model"""
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(Integer, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    level = Column(Enum(LogLevel), default=LogLevel.INFO, nullable=False, index=True)
    message = Column(Text, nullable=False)
    source = Column(String(255), nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationship
    system = relationship("System", back_populates="logs")
    
    def __repr__(self):
        return f"<Log(id={self.id}, level='{self.level}', system_id={self.system_id})>"
