# Django DRF Backend Requirements for Tranzo

This document outlines the exact database models and REST API endpoints required to replace all the static/mock data in the current Tranzo frontend with a real Django REST Framework (DRF) backend.

## 1. Authentication & Authorization Strategy
*   **Method:** JSON Web Tokens (JWT) using `djangorestframework-simplejwt`.
*   **Roles:** The system has 3 distinct roles: `Customer`, `Driver`, and `Admin`.
*   **Permissions:** You will need custom DRF permission classes (e.g., `IsCustomer`, `IsDriver`, `IsAdmin`).

---

## 2. Database Models (Django ORM)

### `User` (Custom User Model)
Extend Django's `AbstractUser`.
*   `email` (EmailField, unique, used as username)
*   `name` (CharField)
*   `role` (CharField, choices: `customer`, `driver`, `admin`)
*   `phone_number` (CharField, optional)
*   `created_at` (DateTimeField, auto_now_add=True)

### `DriverProfile`
One-to-One relationship with `User` (where role='driver').
*   `user` (OneToOneField to User)
*   `status` (CharField, choices: `pending_docs`, `pending_verification`, `verified`, `suspended`, `rejected`, default: `pending_docs`)
*   `vehicle_type` (CharField, choices: `bike`, `mini_truck`, `pickup`, `large_truck`, null=True)
*   `license_plate` (CharField, null=True)
*   `license_document` (FileField/ImageField, upload_to='driver_docs/', null=True)
*   `insurance_document` (FileField/ImageField, upload_to='driver_docs/', null=True)
*   `rating` (DecimalField, max_digits=3, decimal_places=1, default=0.0)
*   `total_deliveries` (IntegerField, default=0)
*   `is_online` (BooleanField, default=False)

### `Order` (Delivery Booking)
*   `customer` (ForeignKey to User, related_name='customer_orders')
*   `driver` (ForeignKey to User, related_name='driver_orders', null=True, blank=True)
*   `pickup_address` (CharField/TextField) - *Map coords ignored for now*
*   `dropoff_address` (CharField/TextField) - *Map coords ignored for now*
*   `package_details` (TextField)
*   `vehicle_requested` (CharField, choices: `bike`, `mini_truck`, `pickup`, `large_truck`)
*   `status` (CharField, choices: `pending`, `accepted`, `picked_up`, `in_transit`, `delivered`, `cancelled`, default: `pending`)
*   `price` (DecimalField, max_digits=10, decimal_places=2)
*   `distance_km` (DecimalField, max_digits=6, decimal_places=2, null=True)
*   `created_at` (DateTimeField, auto_now_add=True)
*   `updated_at` (DateTimeField, auto_now=True)
*   `completed_at` (DateTimeField, null=True, blank=True)

---

## 3. API Endpoints (DRF Views/ViewSets)

### A. Authentication APIs (`/api/auth/`)
1.  **POST `/api/auth/register/customer/`**
    *   *Payload:* `name`, `email`, `password`
    *   *Action:* Creates User with role `customer`. Returns JWT tokens.
2.  **POST `/api/auth/register/driver/`**
    *   *Payload:* `name`, `email`, `password`
    *   *Action:* Creates User with role `driver`, creates empty `DriverProfile` with status `pending_docs`. Returns JWT tokens.
3.  **POST `/api/auth/login/`**
    *   *Payload:* `email`, `password`
    *   *Action:* Validates credentials, returns JWT tokens + user object (including role and driver status if applicable).
4.  **GET `/api/auth/me/`**
    *   *Headers:* `Authorization: Bearer <token>`
    *   *Action:* Returns current user profile details.

### B. Customer APIs (`/api/customer/`)
*Requires `IsCustomer` permission.*
1.  **POST `/api/customer/orders/`** (Create Booking)
    *   *Payload:* `pickup_address`, `dropoff_address`, `package_details`, `vehicle_requested`, `price`, `distance_km`
    *   *Action:* Creates a new Order with status `pending`.
2.  **GET `/api/customer/orders/`** (Order History)
    *   *Action:* Returns list of orders belonging to the requesting customer.
3.  **GET `/api/customer/orders/<id>/`** (Track Order)
    *   *Action:* Returns specific order details, including driver info if assigned.
4.  **PATCH `/api/customer/orders/<id>/cancel/`**
    *   *Action:* Changes order status to `cancelled` (only if currently `pending`).

### C. Driver APIs (`/api/driver/`)
*Requires `IsDriver` permission.*
1.  **POST `/api/driver/onboarding/`** (Upload Docs)
    *   *Payload (Multipart/Form-Data):* `vehicle_type`, `license_plate`, `license_document`, `insurance_document`
    *   *Action:* Updates `DriverProfile`, changes status to `pending_verification`.
2.  **GET `/api/driver/orders/available/`** (Job Board)
    *   *Action:* Returns list of orders where status is `pending` AND `vehicle_requested` matches the driver's `vehicle_type`.
3.  **PATCH `/api/driver/orders/<id>/accept/`**
    *   *Action:* Assigns the requesting driver to the order, changes status to `accepted`.
4.  **PATCH `/api/driver/orders/<id>/status/`**
    *   *Payload:* `status` (e.g., `picked_up`, `in_transit`, `delivered`)
    *   *Action:* Updates the progress of the active order.
5.  **GET `/api/driver/orders/active/`**
    *   *Action:* Returns the driver's currently active order (status not in `delivered`, `cancelled`).
6.  **GET `/api/driver/orders/history/`**
    *   *Action:* Returns list of completed orders for this driver.
7.  **GET `/api/driver/stats/`**
    *   *Action:* Returns aggregated data: total earnings (sum of price of delivered orders), total deliveries, current rating.

### D. Admin APIs (`/api/admin/`)
*Requires `IsAdmin` permission.*
1.  **GET `/api/admin/stats/`** (Dashboard Stats)
    *   *Action:* Returns total revenue, active drivers, active orders, total customers.
2.  **GET `/api/admin/drivers/`** (Drivers Management)
    *   *Query Params:* `?status=pending_verification` (for filtering)
    *   *Action:* Returns list of all drivers and their profiles/documents.
3.  **PATCH `/api/admin/drivers/<id>/approve/`**
    *   *Payload:* `status` (`verified`, `rejected`, `suspended`)
    *   *Action:* Updates the driver's profile status.
4.  **GET `/api/admin/orders/`** (Orders Management)
    *   *Action:* Returns list of all orders in the system for monitoring.

---

## 4. Frontend Integration Notes (For Later)
Once the DRF backend is running:
1.  Replace the `setTimeout` mock logic in `src/store/authStore.ts` and the Login/Register components with `axios` or `fetch` calls to the `/api/auth/` endpoints.
2.  Store the returned JWT token in `localStorage` or cookies.
3.  Add an Axios interceptor to automatically attach `Authorization: Bearer <token>` to all requests.
4.  Replace the static arrays (e.g., `initialDrivers` in `DriversManagement.tsx`, mock orders in `OrderHistoryPage.tsx`) with `useEffect` hooks that fetch data from your new Django APIs.
