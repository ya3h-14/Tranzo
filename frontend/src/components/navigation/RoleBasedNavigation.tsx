import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Home, Package, Clock, User, Settings, Users, Truck, LogOut, Tags } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { useAuthStore } from "@/store/authStore";
import { Logo } from "@/components/Logo";

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const customerNav: NavItem[] = [
  { label: "Home", path: "/customer", icon: <Home size={18} /> },
  { label: "Book", path: "/customer/book", icon: <Package size={18} /> },
  { label: "Orders", path: "/customer/orders", icon: <Clock size={18} /> },
  { label: "Profile", path: "/customer/profile", icon: <User size={18} /> },
];

export const driverNav: NavItem[] = [
  { label: "Dashboard", path: "/driver", icon: <Home size={18} /> },
  { label: "Active", path: "/driver/active", icon: <Truck size={18} /> },
  { label: "History", path: "/driver/history", icon: <Clock size={18} /> },
  { label: "Profile", path: "/driver/profile", icon: <User size={18} /> },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <Home size={18} /> },
  { label: "Drivers", path: "/admin/drivers", icon: <Users size={18} /> },
  { label: "Orders", path: "/admin/orders", icon: <Package size={18} /> },
  { label: "Vehicles", path: "/admin/vehicles", icon: <Tags size={18} /> },
  { label: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
];

export function NavbarDesktop({ items, role }: { items: NavItem[]; role: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="hidden md:flex items-center justify-between px-8 py-3 bg-white border-b-2 border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-10">
        <Link to={`/${role}`} className="flex items-center hover:opacity-80 transition-opacity">
          <Logo className="scale-[0.55] origin-left" />
        </Link>
        <div className="flex space-x-2">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 border-2 border-transparent",
                  isActive
                    ? "bg-slate-900 text-amber-500 border-slate-900 shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Dropdown
          trigger={
            <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black cursor-pointer hover:bg-amber-600 transition-all shadow-sm ring-2 ring-amber-100 uppercase">
              {user?.name?.[0] || role[0]}
            </div>
          }
          items={[
            {
              label: "Sign Out",
              icon: <LogOut size={16} />,
              danger: true,
              onClick: handleLogout,
            },
          ]}
        />
      </div>
    </nav>
  );
}

export function MobileBottomNav({ items }: { items: NavItem[] }) {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-100 pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                isActive ? "text-amber-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-all",
                isActive ? "bg-slate-900 text-amber-500 shadow-lg scale-110 -translate-y-1" : ""
              )}>
                {item.icon}
              </div>
              {!isActive && <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function RoleBasedNavigation({ role }: { role: "customer" | "driver" | "admin" }) {
  const items = role === "customer" ? customerNav : role === "driver" ? driverNav : adminNav;

  return (
    <>
      <NavbarDesktop items={items} role={role} />
      <MobileBottomNav items={items} />
    </>
  );
}
