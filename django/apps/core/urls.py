"""
Core URL Configuration.
"""
from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('systems/', views.systems_list, name='systems_list'),
    path('systems/<int:system_id>/', views.system_detail, name='system_detail'),
    path('logs/', views.logs_view, name='logs'),
]
