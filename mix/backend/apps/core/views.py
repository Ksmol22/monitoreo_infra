"""
Core views for dashboard.
"""
from django.shortcuts import render
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from apps.core.models import System, Metric, Log


def dashboard(request):
    """Main dashboard view."""
    # Get system statistics
    total_systems = System.objects.count()
    online_systems = System.objects.filter(status='online').count()
    warning_systems = System.objects.filter(status='warning').count()
    offline_systems = System.objects.filter(status='offline').count()
    
    # Systems by type
    systems_by_type = System.objects.values('type').annotate(count=Count('id'))
    
    # Recent logs
    recent_logs = Log.objects.select_related('system').order_by('-timestamp')[:10]
    
    # Average metrics (last hour)
    one_hour_ago = timezone.now() - timedelta(hours=1)
    avg_metrics = Metric.objects.filter(timestamp__gte=one_hour_ago).aggregate(
        avg_cpu=Avg('cpu_usage'),
        avg_memory=Avg('memory_usage'),
        avg_disk=Avg('disk_usage')
    )
    
    # All systems with latest metrics
    systems = System.objects.all()
    systems_with_metrics = []
    for system in systems:
        latest_metric = Metric.objects.filter(system=system).order_by('-timestamp').first()
        systems_with_metrics.append({
            'system': system,
            'metric': latest_metric
        })
    
    context = {
        'total_systems': total_systems,
        'online_systems': online_systems,
        'warning_systems': warning_systems,
        'offline_systems': offline_systems,
        'systems_by_type': systems_by_type,
        'recent_logs': recent_logs,
        'avg_cpu': avg_metrics['avg_cpu'] or 0,
        'avg_memory': avg_metrics['avg_memory'] or 0,
        'avg_disk': avg_metrics['avg_disk'] or 0,
        'systems_with_metrics': systems_with_metrics,
    }
    
    return render(request, 'dashboard.html', context)


def systems_list(request):
    """List all systems."""
    system_type = request.GET.get('type', None)
    
    systems = System.objects.all()
    if system_type:
        systems = systems.filter(type=system_type)
    
    return render(request, 'systems_list.html', {'systems': systems})


def system_detail(request, system_id):
    """System detail view with metrics and logs."""
    system = System.objects.get(id=system_id)
    
    # Get last 24 hours of metrics
    one_day_ago = timezone.now() - timedelta(days=1)
    metrics = Metric.objects.filter(
        system=system,
        timestamp__gte=one_day_ago
    ).order_by('-timestamp')[:100]
    
    # Get recent logs
    logs = Log.objects.filter(system=system).order_by('-timestamp')[:50]
    
    context = {
        'system': system,
        'metrics': metrics,
        'logs': logs,
    }
    
    return render(request, 'system_detail.html', context)


def logs_view(request):
    """Logs view."""
    level = request.GET.get('level', None)
    system_id = request.GET.get('system_id', None)
    
    logs = Log.objects.select_related('system').order_by('-timestamp')
    
    if level:
        logs = logs.filter(level=level)
    if system_id:
        logs = logs.filter(system_id=system_id)
    
    logs = logs[:100]
    
    systems = System.objects.all()
    
    context = {
        'logs': logs,
        'systems': systems,
        'selected_level': level,
        'selected_system_id': system_id,
    }
    
    return render(request, 'logs.html', context)
