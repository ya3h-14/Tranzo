from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('drivers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='driverprofile',
            name='status_reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
