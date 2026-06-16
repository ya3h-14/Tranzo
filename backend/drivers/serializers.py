from rest_framework import serializers
from .models import DriverProfile, VehicleCategory
from accounts.serializers import UserSerializer
from django.db.models import Sum
from orders.models import Order

class VehicleCategorySerializer(serializers.ModelSerializer):
    online_drivers_count = serializers.SerializerMethodField()

    class Meta:
        model = VehicleCategory
        fields = '__all__'

    def get_online_drivers_count(self, obj):
        return DriverProfile.objects.filter(
            vehicle_category=obj,
            is_online=True,
            status='verified'
        ).count()

class DriverProfileSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    vehicle_category_details = VehicleCategorySerializer(source='vehicle_category', read_only=True)
    vehicle_category_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleCategory.objects.all(),
        source='vehicle_category',
        write_only=True,
        required=False
    )

    class Meta:
        model = DriverProfile
        fields = [
            'id', 'user', 'status', 'vehicle_category', 'vehicle_category_details',
            'vehicle_category_id', 'vehicle_type', 'license_plate', 'license_document',
            'insurance_document', 'rating', 'total_deliveries', 'is_online',
            'user_details', 'status_reason', 'is_reapplied', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'rating', 'total_deliveries', 'is_reapplied', 'updated_at', 'vehicle_category']

class DriverStatsSerializer(serializers.Serializer):
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_deliveries = serializers.IntegerField()
    current_rating = serializers.DecimalField(max_digits=3, decimal_places=1)
