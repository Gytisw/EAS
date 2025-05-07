"""
URL configuration for eas_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include # Ensure include is imported
from rest_framework.routers import DefaultRouter
from .auth_views import GoogleLogin # Import the custom GoogleLogin view
from eas_core import views as eas_core_views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'task-configs', eas_core_views.TaskConfigViewSet, basename='taskconfig')
router.register(r'schedules', eas_core_views.ScheduleViewSet, basename='schedule')
# Add other viewsets here

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')), # allauth handles the primary social login flow
    # dj_rest_auth URLs for token management and social connect views
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'), # Use the custom GoogleLogin view
    # path('api/auth/registration/', include('dj_rest_auth.registration.urls')), # Optional: if using dj_rest_auth's own registration
    
    # API endpoints from our router
    path('api/', include(router.urls)),
    # ... other app urls
]
