from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User
from drivers.models import DriverProfile
from drf_spectacular.utils import extend_schema_field

class UserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    status_reason = serializers.SerializerMethodField()
    vehicle_info = serializers.SerializerMethodField()
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "role",
            "phone_number",
            "address",
            "city",
            "pincode",
            "created_at",
            "status",
            "status_reason",
            "vehicle_info",
            "is_online",
        ]
        read_only_fields = ["id", "created_at", "role"]

    @extend_schema_field(serializers.CharField())
    def get_status(self, obj):
        if obj.role == 'driver' and hasattr(obj, 'driver_profile'):
            return obj.driver_profile.status
        return None

    @extend_schema_field(serializers.CharField())
    def get_status_reason(self, obj):
        if obj.role == 'driver' and hasattr(obj, 'driver_profile'):
            return obj.driver_profile.status_reason
        return None

    @extend_schema_field(serializers.BooleanField())
    def get_is_online(self, obj):
        if obj.role == 'driver' and hasattr(obj, 'driver_profile'):
            return obj.driver_profile.is_online
        return False

    @extend_schema_field(serializers.DictField())
    def get_vehicle_info(self, obj):
        if obj.role == 'driver' and hasattr(obj, 'driver_profile'):
            profile = obj.driver_profile
            # Prefer category name over legacy vehicle_type field
            v_type = profile.vehicle_category.name if profile.vehicle_category else profile.vehicle_type
            return {
                "vehicle_type": v_type,
                "license_plate": profile.license_plate,
                "rating": str(profile.rating),
                "total_deliveries": profile.total_deliveries,
                "category_id": profile.vehicle_category_id if profile.vehicle_category else None
            }
        return None

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class TokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()

class LoginResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    tokens = TokenSerializer()

class RegisterCustomerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["name", "email", "password", "phone_number"]

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            role='customer',
            **validated_data
        )

class RegisterDriverSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["name", "email", "password", "phone_number", "city"]

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            role='driver',
            **validated_data
        )
        DriverProfile.objects.create(user=user)
        return user