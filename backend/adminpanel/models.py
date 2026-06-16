from django.db import models

class SystemSettings(models.Model):
    platform_fee_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,
        help_text="Percentage of each order that goes to the platform."
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"

    def __str__(self):
        return f"System Settings (Fee: {self.platform_fee_percentage}%)"

    @classmethod
    def get_settings(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj
