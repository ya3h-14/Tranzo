import React from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { DriverOnboarding } from "./DriverOnboarding";
import { DriverPendingVerification } from "./DriverPendingVerification";
import { DriverRejected } from "./DriverRejected";
import { DriverSuspended } from "./DriverSuspended";

export function DriverStatusGuard() {
  const user = useAuthStore((state) => state.user);

  if (user?.status === "pending_docs") {
    return <DriverOnboarding />;
  }

  if (user?.status === "pending_verification") {
    return <DriverPendingVerification />;
  }

  if (user?.status === "rejected") {
    return <DriverRejected />;
  }

  if (user?.status === "suspended") {
    return <DriverSuspended />;
  }

  // If verified or status is undefined (legacy mock users), show the normal driver layout
  return <Outlet />;
}
