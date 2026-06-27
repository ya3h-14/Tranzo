import logging
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from django.core.cache import cache

from .models import User
from .serializers import (
    UserSerializer,
    LoginSerializer,
    LoginResponseSerializer,
    RegisterCustomerSerializer,
    RegisterDriverSerializer
)
from .utils import generate_otp, send_otp_email, send_password_reset_email
from drivers.models import DriverProfile

logger = logging.getLogger(__name__)

def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

@extend_schema(request=RegisterCustomerSerializer, responses={201: dict})
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def register_customer(request):
    serializer = RegisterCustomerSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=400)

        otp = generate_otp()

        # Send email BEFORE creating database record
        email_sent = send_otp_email(email, serializer.validated_data["name"], otp)

        if not email_sent:
            return Response({"error": "Failed to send verification email. Please check if the email address is valid."}, status=400)

        # Temporarily store registration data in cache (expires in 15 mins)
        cache_key = f"registration_{email}"
        registration_data = {
            "data": serializer.validated_data,
            "otp": otp,
            "role": "customer",
            "created_at": timezone.now().timestamp()
        }
        cache.set(cache_key, registration_data, timeout=900)

        return Response({
            "message": "OTP sent to your email. Verification required to complete registration.",
            "email": email,
            "role": "customer"
        }, status=201)
    return Response(serializer.errors, status=400)

@extend_schema(request=RegisterDriverSerializer, responses={201: dict})
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def register_driver(request):
    serializer = RegisterDriverSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."}, status=400)

        otp = generate_otp()

        # Send email BEFORE creating database record
        email_sent = send_otp_email(email, serializer.validated_data["name"], otp)

        if not email_sent:
            return Response({"error": "Failed to send verification email. Please check if the email address is valid."}, status=400)

        # Temporarily store registration data in cache (expires in 15 mins)
        cache_key = f"registration_{email}"
        registration_data = {
            "data": serializer.validated_data,
            "otp": otp,
            "role": "driver",
            "created_at": timezone.now().timestamp()
        }
        cache.set(cache_key, registration_data, timeout=900)

        return Response({
            "message": "OTP sent to your email. Verification required to complete registration.",
            "email": email,
            "role": "driver"
        }, status=201)
    return Response(serializer.errors, status=400)

@extend_schema(
    request=dict,
    responses={200: LoginResponseSerializer}
)
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    purpose = request.data.get("purpose", "registration")

    if not email or not otp:
        return Response({"error": "Email and OTP are required"}, status=400)

    if purpose == "password_change":
        cache_key = f"password_change_otp_{email}"
        reg_data = cache.get(cache_key)
        if not reg_data:
            return Response({"error": "No password change request found or OTP expired."}, status=400)

        if reg_data["otp"] != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        new_password = reg_data["new_password"]
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            cache.delete(cache_key)
            return Response({"message": "Password updated successfully!"}, status=200)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

    # Check cache for pending registration
    cache_key = f"registration_{email}"
    reg_data = cache.get(cache_key)

    if not reg_data:
        # Check if user is already in DB (already verified or legacy)
        try:
            user = User.objects.get(email=email)
            if user.is_verified:
                return Response({"error": "User is already verified. Please login."}, status=400)
        except User.DoesNotExist:
            return Response({"error": "No pending registration found for this email. Please register again."}, status=400)

    # Verify OTP
    if reg_data["otp"] != otp:
        return Response({"error": "Invalid OTP"}, status=400)

    # Check expiry (10 mins)
    if (timezone.now().timestamp() - reg_data["created_at"]) > 600:
        return Response({"error": "OTP has expired. Please register again."}, status=400)

    # OTP Valid: NOW create the user in the database
    data = reg_data["data"]
    role = reg_data["role"]

    try:
        user = User.objects.create_user(
            email=email,
            name=data["name"],
            password=data["password"],
            phone_number=data.get("phone_number"),
            role=role,
            is_verified=True,
            is_active=True
        )

        # Additional fields based on role
        if role == 'driver':
            user.city = data.get("city")
            user.save()
            DriverProfile.objects.create(user=user)

        # Clear cache
        cache.delete(cache_key)

        tokens = get_tokens(user)
        return Response({
            "message": "Registration complete and email verified!",
            "user": UserSerializer(user).data,
            "tokens": tokens
        }, status=200)
    except Exception as e:
        logger.error(f"Error creating user after OTP verification: {str(e)}")
        return Response({"error": "An error occurred while creating your account. Please try again."}, status=500)

@extend_schema(request=dict, responses={200: dict})
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def resend_otp(request):
    email = request.data.get("email")
    purpose = request.data.get("purpose", "registration")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    cache_key = f"registration_{email}" if purpose == "registration" else f"password_change_otp_{email}"
    reg_data = cache.get(cache_key)

    if not reg_data:
        return Response({"error": "No pending request found. Please start the process again."}, status=400)

    # Generate new OTP and update cache
    new_otp = generate_otp()
    reg_data["otp"] = new_otp
    reg_data["created_at"] = timezone.now().timestamp()
    cache.set(cache_key, reg_data, timeout=900)

    # For resend, we might not have request.user if it's registration
    name = reg_data.get("data", {}).get("name", "User")
    email_sent = send_otp_email(email, name, new_otp)

    if not email_sent:
        return Response({"error": "Failed to send email. Please check the address."}, status=500)

    return Response({
        "message": "New OTP sent successfully",
        "email_sent": True
    }, status=200)

@extend_schema(request=LoginSerializer, responses={200: LoginResponseSerializer})
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    user = authenticate(request, username=email, password=password)

    if user is None:
        user_exists = User.objects.filter(email=email).exists()
        if not user_exists:
            return Response({"error": "User does not exist."}, status=400)
        return Response({"error": "Invalid password."}, status=400)

    if not user.is_active:
        return Response({"error": "User account is disabled."}, status=400)

    tokens = get_tokens(user)

    return Response({
        "user": UserSerializer(user).data,
        "tokens": tokens
    })

@extend_schema(responses={200: UserSerializer})
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)

    elif request.method == "PATCH":
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_password_change(request):
    email = request.user.email
    new_password = request.data.get("new_password")

    if not new_password:
        return Response({"error": "New password is required"}, status=400)

    otp = generate_otp()
    email_sent = send_otp_email(email, request.user.name, otp)

    if not email_sent:
        return Response({"error": "Failed to send verification email."}, status=500)

    cache_key = f"password_change_otp_{email}"
    cache.set(cache_key, {
        "otp": otp,
        "new_password": new_password,
        "created_at": timezone.now().timestamp()
    }, timeout=900)

    return Response({"message": "OTP sent to your email for verification."}, status=200)

@extend_schema(request=dict, responses={200: dict})
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def forgot_password(request):
    """Sends a password reset OTP to the user's registered email (unauthenticated)."""
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required."}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "No account found with this email address."}, status=404)

    otp = generate_otp()
    email_sent = send_password_reset_email(email, user.name, otp)

    if not email_sent:
        return Response({"error": "Failed to send reset email. Please try again later."}, status=500)

    cache_key = f"forgot_password_otp_{email}"
    cache.set(cache_key, {
        "otp": otp,
        "created_at": timezone.now().timestamp()
    }, timeout=900)

    return Response({"message": "Password reset code sent to your email."}, status=200)

@extend_schema(request=dict, responses={200: dict})
@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def reset_password(request):
    """Verifies OTP and resets the user's password (unauthenticated)."""
    email = request.data.get("email")
    otp = request.data.get("otp")
    new_password = request.data.get("new_password")

    if not email or not otp or not new_password:
        return Response({"error": "Email, OTP, and new password are required."}, status=400)

    if len(new_password) < 6:
        return Response({"error": "Password must be at least 6 characters."}, status=400)

    cache_key = f"forgot_password_otp_{email}"
    cached_data = cache.get(cache_key)

    if not cached_data:
        return Response({"error": "No reset request found or code has expired. Please request a new one."}, status=400)

    if cached_data["otp"] != otp:
        return Response({"error": "Invalid verification code."}, status=400)

    # Check expiry (10 mins)
    if (timezone.now().timestamp() - cached_data["created_at"]) > 600:
        cache.delete(cache_key)
        return Response({"error": "Verification code has expired. Please request a new one."}, status=400)

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        cache.delete(cache_key)
        return Response({"message": "Password reset successfully! You can now sign in with your new password."}, status=200)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
