"""
Core models for infrastructure monitoring.
"""
from django.db import models
from django.core.validators import validate_ipv4_address
from django.utils import timezone


class System(models.Model):
    """
    Represents a monitored system (Windows, Linux, or Database server).
    """
    SYSTEM_TYPES = [
        ('windows', 'Windows Server'),
        ('linux', 'Linux Server'),
        ('database', 'Database Server'),
    ]
    
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('warning', 'Warning'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=20, choices=SYSTEM_TYPES)
    ip_address = models.GenericIPAddressField(validators=[validate_ipv4_address])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    version = models.CharField(max_length=100, blank=True, null=True)
    last_seen = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Ansible connection details
    ansible_user = models.CharField(max_length=100, blank=True, null=True)
    ansible_port = models.IntegerField(default=22)
    ansible_connection = models.CharField(
        max_length=20,
        choices=[('ssh', 'SSH'), ('winrm', 'WinRM'), ('psrp', 'PowerShell Remoting')],
        default='ssh'
    )
    
    class Meta:
        db_table = 'systems'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type', 'status']),
            models.Index(fields=['ip_address']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.type})"
    
    def update_status(self):
        """Update system status based on last_seen timestamp."""
        now = timezone.now()
        diff = (now - self.last_seen).total_seconds()
        
        if diff < 300:  # 5 minutes
            self.status = 'online'
        elif diff < 600:  # 10 minutes
            self.status = 'warning'
        else:
            self.status = 'offline'
        
        self.save()


class Metric(models.Model):
    """
    System performance metrics (CPU, Memory, Disk, Network).
    """
    system = models.ForeignKey(
        System,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    cpu_usage = models.DecimalField(max_digits=5, decimal_places=2)
    memory_usage = models.DecimalField(max_digits=5, decimal_places=2)
    disk_usage = models.DecimalField(max_digits=5, decimal_places=2)
    network_in = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    network_out = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'metrics'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['system', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.system.name} - {self.timestamp}"


class Log(models.Model):
    """
    System logs and events.
    """
    LEVEL_CHOICES = [
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    system = models.ForeignKey(
        System,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    message = models.TextField()
    source = models.CharField(max_length=255, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['system', '-timestamp']),
            models.Index(fields=['level', '-timestamp']),
        ]
    
    def __str__(self):
        return f"[{self.level.upper()}] {self.system.name} - {self.message[:50]}"
