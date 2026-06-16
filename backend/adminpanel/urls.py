from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminStatsView, AdminVehicleCategoryViewSet, SystemSettingsView
from drivers.views import AdminDriverViewSet
from orders.views import AdminOrderViewSet

router = DefaultRouter()
router.register(r'drivers', AdminDriverViewSet, basename='admin-drivers')
router.register(r'orders', AdminOrderViewSet, basename='admin-orders')
router.register(r'vehicles', AdminVehicleCategoryViewSet, basename='admin-vehicles')

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('settings/', SystemSettingsView.as_view(), name='admin-settings'),
    path('', include(router.urls)),
]
