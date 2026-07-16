from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerOrderViewSet

router = DefaultRouter()
router.register(r'orders', CustomerOrderViewSet, basename='customer-orders')

urlpatterns = [
    path('', include(router.urls)),
]