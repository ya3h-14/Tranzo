import React from "react";
import { Outlet } from "react-router-dom";
import { RoleBasedNavigation } from "@/components/navigation/RoleBasedNavigation";

export function AppLayout({ role }: { role: "customer" | "driver" | "admin" }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 md:pb-0 relative">
      {/* Brand accent line */}
      <div className="h-1 bg-amber-500 w-full fixed top-0 z-[60] md:hidden" />

      <RoleBasedNavigation role={role} />

      <main className="container mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>

      {/* Background decoration for industrial feel */}
      <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-slate-200 rounded-full opacity-30 blur-3xl pointer-events-none -z-10" />
    </div>
  );
}
