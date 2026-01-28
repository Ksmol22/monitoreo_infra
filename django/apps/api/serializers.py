"""
Serializers for API.
"""
from rest_framework import serializers
from apps.core.models import System, Metric, Log


class SystemSerializer(serializers.ModelSerializer):
    """Serializer for System model."""
    
    class Meta:
        model = System
        fields = [
            'id', 'name', 'type', 'ip_address', 'status', 'version',
            'last_seen', 'created_at', 'ansible_user', 'ansible_port',
            'ansible_connection'
        ]
        read_only_fields = ['last_seen', 'created_at']


class SystemListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing systems."""
    
    class Meta:
        model = System
        fields = ['id', 'name', 'type', 'ip_address', 'status', 'last_seen']


class MetricSerializer(serializers.ModelSerializer):
    """Serializer for Metric model."""
    system_name = serializers.CharField(source='system.name', read_only=True)
    system_type = serializers.CharField(source='system.type', read_only=True)
    
    class Meta:
        model = Metric
        fields = [
            'id', 'system', 'system_name', 'system_type',
            'cpu_usage', 'memory_usage', 'disk_usage',
            'network_in', 'network_out', 'timestamp'
        ]
        read_only_fields = ['timestamp']


class MetricBulkSerializer(serializers.Serializer):
    """Serializer for bulk metric creation."""
    metrics = MetricSerializer(many=True)
    
    def create(self, validated_data):
        metrics_data = validated_data.pop('metrics')
        metrics = [Metric(**data) for data in metrics_data]
        return Metric.objects.bulk_create(metrics)


class LogSerializer(serializers.ModelSerializer):
    """Serializer for Log model."""
    system_name = serializers.CharField(source='system.name', read_only=True)
    
    class Meta:
        model = Log
        fields = [
            'id', 'system', 'system_name', 'level',
            'message', 'source', 'timestamp'
        ]
        read_only_fields = ['timestamp']


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics."""
    total_systems = serializers.IntegerField()
    online_systems = serializers.IntegerField()
    warning_systems = serializers.IntegerField()
    offline_systems = serializers.IntegerField()
    systems_by_type = serializers.DictField()
    recent_logs = LogSerializer(many=True)
    avg_cpu_usage = serializers.DecimalField(max_digits=5, decimal_places=2)
    avg_memory_usage = serializers.DecimalField(max_digits=5, decimal_places=2)
    avg_disk_usage = serializers.DecimalField(max_digits=5, decimal_places=2)
