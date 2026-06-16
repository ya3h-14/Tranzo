from rest_framework import serializers
from .models import Order
from accounts.serializers import UserSerializer
from drivers.serializers import VehicleCategorySerializer
from drivers.models import VehicleCategory

class OrderSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source='customer', read_only=True)
    driver_details = UserSerializer(source='driver', read_only=True)
    vehicle_category_details = VehicleCategorySerializer(source='vehicle_category', read_only=True)

    # Allow passing the ID when creating
    vehicle_category_id = serializers.PrimaryKeyRelatedField(
        queryset=VehicleCategory.objects.all(),
        source='vehicle_category',
        write_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'driver', 'vehicle_category', 'vehicle_category_details',
            'vehicle_category_id', 'pickup_address', 'dropoff_address',
            'pickup_lat', 'pickup_lng', 'dropoff_lat', 'dropoff_lng',
            'goods_type', 'estimated_weight', 'package_details',
            'status', 'price', 'distance_km', 'created_at', 'updated_at',
            'completed_at', 'customer_details', 'driver_details'
        ]
        read_only_fields = [
            'id', 'customer', 'driver', 'status', 'price',
            'created_at', 'updated_at', 'completed_at', 'vehicle_category'
        ]

    def create(self, validated_data):
        return super().create(validated_data)
