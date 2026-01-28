"""
API Views using Django REST Framework.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.core.models import System, Metric, Log
from .serializers import (
    SystemSerializer, SystemListSerializer,
    MetricSerializer, MetricBulkSerializer,
    LogSerializer, DashboardStatsSerializer
)


class SystemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for System CRUD operations.
    
    GET /api/v1/systems/ - List all systems
    POST /api/v1/systems/ - Create system
    GET /api/v1/systems/{id}/ - Get system detail
    PATCH /api/v1/systems/{id}/ - Update system
    DELETE /api/v1/systems/{id}/ - Delete system
    GET /api/v1/systems/stats/ - Get statistics
    """
    queryset = System.objects.all()
    serializer_class = SystemSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SystemListSerializer
        return SystemSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get system statistics."""
        stats = {
            'total': System.objects.count(),
            'online': System.objects.filter(status='online').count(),
            'warning': System.objects.filter(status='warning').count(),
            'offline': System.objects.filter(status='offline').count(),
            'by_type': {}
        }
        
        # Count by type
        type_counts = System.objects.values('type').annotate(count=Count('id'))
        for item in type_counts:
            stats['by_type'][item['type']] = item['count']
        
        return Response(stats)


class MetricViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Metric operations.
    
    GET /api/v1/metrics/ - List metrics (filter by system_id, limit)
    POST /api/v1/metrics/ - Create single metric
    POST /api/v1/metrics/bulk/ - Create multiple metrics
    GET /api/v1/metrics/{id}/ - Get metric detail
    GET /api/v1/metrics/latest/ - Get latest metrics per system
    """
    queryset = Metric.objects.select_related('system').all()
    serializer_class = MetricSerializer
    filterset_fields = ['system', 'system__type']
    ordering_fields = ['timestamp']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by system_id if provided
        system_id = self.request.query_params.get('system_id')
        if system_id:
            queryset = queryset.filter(system_id=system_id)
        
        # Limit results
        limit = self.request.query_params.get('limit', 100)
        try:
            limit = int(limit)
            queryset = queryset[:limit]
        except ValueError:
            pass
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk(self, request):
        """Create multiple metrics at once."""
        serializer = MetricBulkSerializer(data={'metrics': request.data})
        serializer.is_valid(raise_exception=True)
        metrics = serializer.save()
        return Response(
            MetricSerializer(metrics, many=True).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest metric for each system."""
        latest_metrics = []
        systems = System.objects.all()
        
        for system in systems:
            metric = Metric.objects.filter(system=system).order_by('-timestamp').first()
            if metric:
                latest_metrics.append(metric)
        
        serializer = MetricSerializer(latest_metrics, many=True)
        return Response(serializer.data)


class LogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Log operations.
    
    GET /api/v1/logs/ - List logs (filter by system_id, level, limit)
    POST /api/v1/logs/ - Create log
    GET /api/v1/logs/{id}/ - Get log detail
    GET /api/v1/logs/recent/ - Get recent logs
    """
    queryset = Log.objects.select_related('system').all()
    serializer_class = LogSerializer
    filterset_fields = ['system', 'level', 'system__type']
    search_fields = ['message', 'source']
    ordering_fields = ['timestamp', 'level']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by system_id
        system_id = self.request.query_params.get('system_id')
        if system_id:
            queryset = queryset.filter(system_id=system_id)
        
        # Filter by level
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)
        
        # Limit results
        limit = self.request.query_params.get('limit', 100)
        try:
            limit = int(limit)
            queryset = queryset[:limit]
        except ValueError:
            pass
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent logs (last hour)."""
        one_hour_ago = timezone.now() - timedelta(hours=1)
        logs = Log.objects.filter(timestamp__gte=one_hour_ago).order_by('-timestamp')[:50]
        serializer = LogSerializer(logs, many=True)
        return Response(serializer.data)


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for dashboard data.
    
    GET /api/v1/dashboard/ - Get dashboard statistics
    """
    
    def list(self, request):
        """Get complete dashboard data."""
        # System statistics
        total_systems = System.objects.count()
        online_systems = System.objects.filter(status='online').count()
        warning_systems = System.objects.filter(status='warning').count()
        offline_systems = System.objects.filter(status='offline').count()
        
        # Systems by type
        systems_by_type = {}
        type_counts = System.objects.values('type').annotate(count=Count('id'))
        for item in type_counts:
            systems_by_type[item['type']] = item['count']
        
        # Recent logs
        recent_logs = Log.objects.select_related('system').order_by('-timestamp')[:10]
        
        # Average metrics (last hour)
        one_hour_ago = timezone.now() - timedelta(hours=1)
        avg_metrics = Metric.objects.filter(timestamp__gte=one_hour_ago).aggregate(
            avg_cpu=Avg('cpu_usage'),
            avg_memory=Avg('memory_usage'),
            avg_disk=Avg('disk_usage')
        )
        
        data = {
            'total_systems': total_systems,
            'online_systems': online_systems,
            'warning_systems': warning_systems,
            'offline_systems': offline_systems,
            'systems_by_type': systems_by_type,
            'recent_logs': LogSerializer(recent_logs, many=True).data,
            'avg_cpu_usage': avg_metrics['avg_cpu'] or 0,
            'avg_memory_usage': avg_metrics['avg_memory'] or 0,
            'avg_disk_usage': avg_metrics['avg_disk'] or 0,
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
