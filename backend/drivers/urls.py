from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DriverOnboardingView,
    DriverStatsView,
    AdminDriverViewSet,
    driver_reapply,
    toggle_online,
    list_categories
)
from orders.views import DriverOrderViewSet

router = DefaultRouter()
router.register(r'orders', DriverOrderViewSet, basename='driver-orders')

urlpatterns = [
    path('onboarding/', DriverOnboardingView.as_view(), name='driver-onboarding'),
    path('stats/', DriverStatsView.as_view(), name='driver-stats'),
    path('reapply/', driver_reapply, name='driver-reapply'),
    path('toggle-online/', toggle_online, name='driver-toggle-online'),
    path('categories/', list_categories, name='list-categories'),
    path('', include(router.urls)),
]
