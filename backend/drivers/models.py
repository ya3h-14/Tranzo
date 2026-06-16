from django.db import models
from django.conf import settings

class VehicleCategory(models.Model):
    name = models.CharField(max_length=50) # e.g., Tata Ace (Chota Hathi)
    code = models.SlugField(unique=True)     # e.g., tata_ace
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    price_per_km = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    base_distance = models.DecimalField(max_digits=5, decimal_places=2, default=2.00) # km included in base price
    max_weight = models.IntegerField(help_text="Max weight in kg", default=500)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Base: ₹{self.base_price})"

class DriverProfile(models.Model):
    STATUS_CHOICES = (
        ('pending_docs', 'Pending Documents'),
        ('pending_verification', 'Pending Verification'),
        ('verified', 'Verified'),
        ('suspended', 'Suspended'),
        ('rejected', 'Rejected'),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='driver_profile'
    )
    status = models.CharField(
        max_length=25,
        choices=STATUS_CHOICES,
        default='pending_docs'
    )

    # Changed to ForeignKey for dynamic categories
    vehicle_category = models.ForeignKey(
        VehicleCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='drivers'
    )

    # Legacy field - keeping for migration compatibility, can remove later
    vehicle_type = models.CharField(max_length=50, null=True, blank=True)

    license_plate = models.CharField(max_length=20, null=True, blank=True)
    license_document = models.FileField(upload_to='driver_docs/', null=True, blank=True)
    insurance_document = models.FileField(upload_to='driver_docs/', null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    total_deliveries = models.IntegerField(default=0)
    is_online = models.BooleanField(default=False)
    status_reason = models.TextField(null=True, blank=True)
    is_reapplied = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Driver: {self.user.email} - {self.status}"
