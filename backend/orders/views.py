from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from drivers.models import DriverProfile, VehicleCategory
from decimal import Decimal
from accounts.permissions import IsAdmin

class CustomerOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        # Auto-calculate price based on category rates
        category = serializer.validated_data.get('vehicle_category')
        distance = Decimal(serializer.validated_data.get('distance_km', 0))

        # Calculation logic
        if distance <= category.base_distance:
            total_price = category.base_price
        else:
            extra_km = distance - category.base_distance
            total_price = category.base_price + (extra_km * category.price_per_km)

        serializer.save(
            customer=self.request.user,
            price=total_price,
            status='pending'
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status == 'pending':
            order.status = 'cancelled'
            order.save()
            return Response({'status': 'order cancelled'})
        return Response({'error': 'Cannot cancel order in current state'}, status=400)

class DriverOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 1. Orders assigned to this driver
        # 2. OR Pending orders that match the driver's vehicle category
        profile = self.request.user.driver_profile

        assigned_to_me = Order.objects.filter(driver=self.request.user)

        # Only show available orders if driver is online and verified
        available_orders = Order.objects.none()
        if profile.is_online and profile.status == 'verified':
            available_orders = Order.objects.filter(
                status='pending',
                vehicle_category=profile.vehicle_category
            )

        return (assigned_to_me | available_orders).distinct().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        order = self.get_object()
        profile = self.request.user.driver_profile

        if order.status != 'pending':
            return Response({'error': 'Order is no longer available'}, status=400)

        if order.vehicle_category != profile.vehicle_category:
            return Response({'error': 'Vehicle mismatch'}, status=400)

        order.status = 'accepted'
        order.driver = self.request.user
        order.save()

        return Response({'status': 'order accepted'})

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        if order.driver != self.request.user:
            return Response({'error': 'Unauthorized'}, status=403)

        new_status = request.data.get('status')
        valid_statuses = ['picked_up', 'in_transit', 'delivered']

        if new_status in valid_statuses:
            order.status = new_status
            if new_status == 'delivered':
                from django.utils import timezone
                order.completed_at = timezone.now()
            order.save()
            return Response({'status': f'order {new_status}'})
        return Response({'error': 'Invalid status'}, status=400)

class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]