/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./components/navigation/ProtectedRoute";

// Auth
import LandingPage from "./features/LandingPage";
import { RoleSelection } from "./features/auth/RoleSelection";
import { CustomerLogin } from "./features/auth/CustomerLogin";
import { CustomerRegister } from "./features/auth/CustomerRegister";
import { DriverLogin } from "./features/auth/DriverLogin";
import { DriverRegister } from "./features/auth/DriverRegister";
import { AdminLogin } from "./features/auth/AdminLogin";
import { VerifyOtp } from "./features/auth/VerifyOtp";
import { ForgotPassword } from "./features/auth/ForgotPassword";

// Customer
import { HomePage } from "./features/customer/HomePage";
import { BookingPage } from "./features/customer/BookingPage";
import { VehicleSuggestionPage } from "./features/customer/VehicleSuggestionPage";
import { BookingConfirmationPage } from "./features/customer/BookingConfirmationPage";
import { TrackingPage } from "./features/customer/TrackingPage";
import { OrderHistoryPage } from "./features/customer/OrderHistoryPage";
import { CustomerProfilePage } from "./features/customer/CustomerProfilePage";

// Driver
import { DriverDashboard } from "./features/driver/DriverDashboard";
import { DriverActiveOrder } from "./features/driver/DriverActiveOrder";
import { DriverHistory } from "./features/driver/DriverHistory";
import { DriverProfilePage } from "./features/driver/DriverProfilePage";
import { DriverStatusGuard } from "./features/driver/DriverStatusGuard";

// Admin
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { DriversManagement } from "./features/admin/DriversManagement";
import { OrdersManagement } from "./features/admin/OrdersManagement";
import { VehicleCategories } from "./features/admin/VehicleCategories";
import { AdminSettingsPage } from "./features/admin/AdminSettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<RoleSelection />} />
        
        {/* Auth Routes */}
        <Route path="/auth/customer/login" element={<CustomerLogin />} />
        <Route path="/auth/customer/register" element={<CustomerRegister />} />

        {/* Unified Driver and Admin Login */}
        <Route path="/auth/partner/login" element={<DriverLogin />} />
        <Route path="/auth/driver/login" element={<Navigate to="/auth/partner/login" replace />} />
        <Route path="/auth/admin/login" element={<Navigate to="/auth/partner/login" replace />} />

        <Route path="/auth/driver/register" element={<DriverRegister />} />
        <Route path="/auth/verify-otp" element={<VerifyOtp />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/* Customer Routes */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <AppLayout role="customer" />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="book" element={<BookingPage />} />
          <Route path="vehicles" element={<VehicleSuggestionPage />} />
          <Route path="confirm" element={<BookingConfirmationPage />} />
          <Route path="tracking/:id" element={<TrackingPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
        </Route>

        {/* Driver Routes */}
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={["driver"]}>
            <DriverStatusGuard />
          </ProtectedRoute>
        }>
          <Route element={<AppLayout role="driver" />}>
            <Route index element={<DriverDashboard />} />
            <Route path="active/:id?" element={<DriverActiveOrder />} />
            <Route path="history" element={<DriverHistory />} />
            <Route path="profile" element={<DriverProfilePage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="drivers" element={<DriversManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="vehicles" element={<VehicleCategories />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
