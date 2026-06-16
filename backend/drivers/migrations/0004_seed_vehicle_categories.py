from django.db import migrations

def seed_categories(apps, schema_editor):
    VehicleCategory = apps.get_model('drivers', 'VehicleCategory')

    categories = [
        {
            "name": "2-Wheeler (Bike/Scooter)",
            "code": "2_wheeler",
            "base_price": 40.00,
            "price_per_km": 8.00,
            "base_distance": 2.00,
            "max_weight": 20,
            "description": "Best for documents and small parcels"
        },
        {
            "name": "3-Wheeler (Auto/Rickshaw)",
            "code": "3_wheeler",
            "base_price": 150.00,
            "price_per_km": 12.00,
            "base_distance": 2.00,
            "max_weight": 500,
            "description": "Ideal for medium loads within city"
        },
        {
            "name": "Tata Ace (Chota Hathi)",
            "code": "tata_ace",
            "base_price": 250.00,
            "price_per_km": 18.00,
            "base_distance": 2.00,
            "max_weight": 850,
            "description": "Most popular for household and business moving"
        },
        {
            "name": "Pickup / Bolero",
            "code": "pickup",
            "base_price": 400.00,
            "price_per_km": 22.00,
            "base_distance": 2.00,
            "max_weight": 1500,
            "description": "Powerful vehicle for heavy hardware and machinery"
        },
        {
            "name": "7ft Truck",
            "code": "truck_7ft",
            "base_price": 350.00,
            "price_per_km": 20.00,
            "base_distance": 2.00,
            "max_weight": 1000,
            "description": "Perfect for furniture and commercial goods"
        },
        {
            "name": "14ft Truck (Eicher)",
            "code": "truck_14ft",
            "base_price": 800.00,
            "price_per_km": 35.00,
            "base_distance": 5.00,
            "max_weight": 4000,
            "description": "Large truck for industrial logistics"
        }
    ]

    for cat in categories:
        VehicleCategory.objects.get_or_create(
            code=cat['code'],
            defaults=cat
        )

def remove_categories(apps, schema_editor):
    VehicleCategory = apps.get_model('drivers', 'VehicleCategory')
    VehicleCategory.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('drivers', '0003_driverprofile_is_reapplied_driverprofile_updated_at'),
    ]

    operations = [
        migrations.RunPython(seed_categories, remove_categories),
    ]
