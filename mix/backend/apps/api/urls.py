"""
API URL Configuration.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SystemViewSet, MetricViewSet, LogViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'systems', SystemViewSet, basename='system')
router.register(r'metrics', MetricViewSet, basename='metric')
router.register(r'logs', LogViewSet, basename='log')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
