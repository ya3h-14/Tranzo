from django.db import migrations
from django.contrib.auth.hashers import make_password

def fix_admin_password(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    email = "admin@gmail.com"

    # Get or create the user
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "name": "System Admin",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True,
            "is_active": True
        }
    )

    # Force set the password to ensure it is hashed correctly
    user.password = make_password("@Admin123")
    user.is_active = True
    user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_seed_admin_user'),
    ]

    operations = [
        migrations.RunPython(fix_admin_password),
    ]
