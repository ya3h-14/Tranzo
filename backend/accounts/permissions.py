from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "customer"


class IsDriver(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "driver"


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "admin"