from django.db import models
from django.conf import settings
from drivers.models import VehicleCategory

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_orders'
    )
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='driver_orders',
        null=True,
        blank=True
    )

    vehicle_category = models.ForeignKey(
        VehicleCategory,
        on_delete=models.PROTECT,
        related_name='orders',
        null=True
    )

    # Text Addresses
    pickup_address = models.TextField()
    dropoff_address = models.TextField()

    # Exact Coordinates for Maps (using higher max_digits to avoid precision errors)
    pickup_lat = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)
    pickup_lng = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)
    dropoff_lat = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)
    dropoff_lng = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)

    goods_type = models.CharField(max_length=100, default="General")
    estimated_weight = models.IntegerField(help_text="Weight in kg", default=0)
    package_details = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Billing Fields
    price = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    driver_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    distance_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Automatically calculate fees if price is set
        if self.price and (not self.platform_fee or not self.driver_earnings):
            from adminpanel.models import SystemSettings
            settings = SystemSettings.get_settings()
            percentage = settings.platform_fee_percentage / 100

            self.platform_fee = self.price * percentage
            self.driver_earnings = self.price - self.platform_fee

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.id} - {self.customer.email} - {self.status}"
