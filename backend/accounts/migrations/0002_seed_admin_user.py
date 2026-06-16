from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_user(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    email = "admin@gmail.com"
    if not User.objects.filter(email=email).exists():
        User.objects.create(
            email=email,
            name="System Admin",
            password=make_password("@Admin123"),
            role="admin",
            is_staff=True,
            is_superuser=True,
            is_active=True
        )

def remove_admin_user(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(email="admin@gmail.com").delete()

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, remove_admin_user),
    ]
