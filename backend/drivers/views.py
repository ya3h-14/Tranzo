from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import DriverProfile, VehicleCategory
from .serializers import DriverProfileSerializer, DriverStatsSerializer, VehicleCategorySerializer
from accounts.permissions import IsDriver, IsAdmin
from accounts.serializers import UserSerializer
from orders.models import Order
from django.db.models import Sum
from drf_spectacular.utils import extend_schema

class DriverOnboardingView(generics.UpdateAPIView):
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_object(self):
        return self.request.user.driver_profile

    def perform_update(self, serializer):
        profile = self.get_object()
        data = self.request.data

        # Logic: Only trigger re-verification if sensitive vehicle data actually CHANGES.
        # Category changes do NOT require re-verification.

        doc_change = 'license_document' in data or 'insurance_document' in data

        # Compare normalized plate strings
        new_plate = str(data.get('license_plate', '')).strip()
        old_plate = str(profile.license_plate or '').strip()

        # Plate change only counts if it's a different non-empty value
        plate_actually_changed = new_plate and new_plate != old_plate

        # Determine if we should move to pending_verification
        should_verify = False

        if doc_change or plate_actually_changed:
            should_verify = True
        elif profile.status in ['pending_docs', 'rejected']:
            # If they were previously stuck, any update should move them forward to review
            should_verify = True

        if should_verify:
            serializer.save(status='pending_verification')
        else:
            # Keep existing status (stay 'verified')
            serializer.save()

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def list_categories(request):
    # This list is used by both Customers (to book) and Drivers (to update profile)
    categories = VehicleCategory.objects.filter(is_active=True)
    serializer = VehicleCategorySerializer(categories, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsDriver])
def toggle_online(request):
    profile = request.user.driver_profile
    profile.is_online = not profile.is_online
    profile.save()
    return Response({
        "is_online": profile.is_online,
        "user": UserSerializer(request.user).data
    })

@extend_schema(responses={200: {"type": "object", "properties": {"status": {"type": "string"}}}})
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated, IsDriver])
def driver_reapply(request):
    profile = request.user.driver_profile
    if profile.status == 'rejected':
        profile.status = 'pending_docs'
        profile.status_reason = None
        profile.is_reapplied = True
        profile.save()
        return Response({'status': 'pending_docs'})
    return Response({'error': 'Only rejected applications can be reapplied.'}, status=400)

class DriverStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get(self, request, *args, **kwargs):
        profile = request.user.driver_profile
        total_earnings = Order.objects.filter(
            driver=request.user,
            status='delivered'
        ).aggregate(Sum('price'))['price__sum'] or 0.00

        return Response({
            'total_earnings': total_earnings,
            'total_deliveries': profile.total_deliveries,
            'current_rating': profile.rating
        })

class AdminDriverViewSet(viewsets.ModelViewSet):
    queryset = DriverProfile.objects.all().order_by('-updated_at')
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get_queryset(self):
        queryset = DriverProfile.objects.all().order_by('-updated_at')
        status_filter = self.request.query_params.get('status')
        vehicle_filter = self.request.query_params.get('vehicle_type')
        is_reapplied = self.request.query_params.get('is_reapplied')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if vehicle_filter:
            queryset = queryset.filter(vehicle_type=vehicle_filter)
        if is_reapplied:
            queryset = queryset.filter(is_reapplied=(is_reapplied.lower() == 'true'))

        return queryset

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        profile = self.get_object()
        new_status = request.data.get('status')
        status_reason = request.data.get('status_reason', '')

        if new_status in ['verified', 'rejected', 'suspended']:
            profile.status = new_status
            profile.status_reason = status_reason

            if new_status == 'suspended':
                profile.is_online = False

            if new_status == 'verified' or new_status == 'rejected':
               profile.is_reapplied = False

            profile.save()
            return Response({
                'status': f'driver {new_status}',
                'status_reason': status_reason,
                'is_online': profile.is_online
            })
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
