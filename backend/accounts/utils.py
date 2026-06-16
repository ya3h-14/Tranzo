import random
import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_otp():
    """Generates a random 6-digit OTP."""
    return str(random.randint(100000, 999999))

def send_otp_email(email, name, otp):
    """
    Sends a professional HTML 6-digit OTP to the provided email.
    Returns True if successful, False otherwise.
    """
    subject = "Verify your TRANZO account - {{ otp }}" # Professional subject line
    subject = subject.replace("{{ otp }}", otp)

    # HTML Context
    context = {
        'name': name,
        'otp': otp,
    }

    # Render HTML from template
    html_content = render_to_string('otp_email.html', context)
    # Create a plain text version for email clients that don't support HTML
    text_content = strip_tags(html_content)

    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    try:
        # Create EmailMultiAlternatives for HTML and Text support
        msg = EmailMultiAlternatives(subject, text_content, email_from, recipient_list)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"Failed to send HTML OTP email to {email}: {str(e)}")
        return False
