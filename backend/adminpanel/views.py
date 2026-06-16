from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets
from accounts.permissions import IsAdmin
from orders.models import Order
from drivers.models import DriverProfile, VehicleCategory
from accounts.models import User
from .models import SystemSettings
from django.db.models import Sum
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from drivers.serializers import VehicleCategorySerializer

class AdminStatsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    platform_earnings = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_drivers = serializers.IntegerField()
    active_orders = serializers.IntegerField()
    total_customers = serializers.IntegerField()

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    @extend_schema(responses={200: AdminStatsSerializer})
    def get(self, request):
        delivered_orders = Order.objects.filter(status='delivered')
        total_revenue = delivered_orders.aggregate(Sum('price'))['price__sum'] or 0.00
        platform_earnings = delivered_orders.aggregate(Sum('platform_fee'))['platform_fee__sum'] or 0.00
        active_drivers = DriverProfile.objects.filter(status='verified', is_online=True).count()
        active_orders = Order.objects.exclude(status__in=['delivered', 'cancelled']).count()
        total_customers = User.objects.filter(role='customer').count()

        return Response({
            'total_revenue': total_revenue,
            'platform_earnings': platform_earnings,
            'active_drivers': active_drivers,
            'active_orders': active_orders,
            'total_customers': total_customers
        })

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ['platform_fee_percentage', 'updated_at']

class SystemSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings)
        return Response(serializer.data)

    def patch(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminVehicleCategoryViewSet(viewsets.ModelViewSet):
    queryset = VehicleCategory.objects.all()
    serializer_class = VehicleCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    lookup_field = 'id'
