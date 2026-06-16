# backend/reset_users.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

def reset():
    users = User.objects.filter(role__in=['customer', 'driver'])
    count = users.count()
    users.delete()
    print(f"Cleanup complete: {count} users removed.")

if __name__ == "__main__":
    reset()