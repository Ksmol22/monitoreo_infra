from django.contrib import admin
from .models import System, Metric, Log


@admin.register(System)
class SystemAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'ip_address', 'status', 'last_seen', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['name', 'ip_address']
    readonly_fields = ['last_seen', 'created_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'type', 'ip_address', 'status', 'version')
        }),
        ('Conexión Ansible', {
            'fields': ('ansible_user', 'ansible_port', 'ansible_connection'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('last_seen', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ['system', 'cpu_usage', 'memory_usage', 'disk_usage', 'timestamp']
    list_filter = ['system__type', 'timestamp']
    search_fields = ['system__name']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        # Metrics should be added via API/Ansible, not manually
        return False


@admin.register(Log)
class LogAdmin(admin.ModelAdmin):
    list_display = ['system', 'level', 'short_message', 'source', 'timestamp']
    list_filter = ['level', 'system__type', 'timestamp']
    search_fields = ['system__name', 'message', 'source']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    def short_message(self, obj):
        return obj.message[:100] + '...' if len(obj.message) > 100 else obj.message
    short_message.short_description = 'Message'
    
    def has_add_permission(self, request):
        # Logs should be added via API/Ansible, not manually
        return False
