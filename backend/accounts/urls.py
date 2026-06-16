from django.urls import path
from .views import register_customer, register_driver, login, me, verify_otp, resend_otp, request_password_change

urlpatterns = [

    path("register/customer/", register_customer),
    path("register/driver/", register_driver),
    path("verify-otp/", verify_otp),
    path("resend-otp/", resend_otp),
    path("login/", login),
    path("me/", me),
    path("request-password-change/", request_password_change),

]