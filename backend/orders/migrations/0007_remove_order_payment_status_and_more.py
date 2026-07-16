from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0006_order_payment_status_order_razorpay_order_id_and_more'),
    ]

    operations = [
        migrations.RemoveField(model_name='order', name='payment_status'),
        migrations.RemoveField(model_name='order', name='razorpay_order_id'),
        migrations.RemoveField(model_name='order', name='razorpay_payment_id'),
        migrations.RemoveField(model_name='order', name='razorpay_signature'),
    ]