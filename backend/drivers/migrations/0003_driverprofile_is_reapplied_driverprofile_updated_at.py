from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('drivers', '0002_driverprofile_status_reason'),
    ]

    operations = [
        migrations.AddField(
            model_name='driverprofile',
            name='is_reapplied',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='driverprofile',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
