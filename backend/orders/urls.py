from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerOrderViewSet, DriverOrderViewSet, AdminOrderViewSet

router = DefaultRouter()
router.register(r'orders', CustomerOrderViewSet, basename='customer-orders')

driver_router = DefaultRouter()
driver_router.register(r'orders', DriverOrderViewSet, basename='driver-orders')

admin_router = DefaultRouter()
admin_router.register(r'orders', AdminOrderViewSet, basename='admin-orders')

urlpatterns = [
    path('', include(router.urls)),
]
