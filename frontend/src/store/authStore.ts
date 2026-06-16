import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VehicleInfo {
  vehicle_type: string;
  license_plate: string;
  rating: string;
  total_deliveries: number;
  category_id?: number | null;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: "customer" | "driver" | "admin";
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  pincode?: string | null;
  created_at?: string;
  status?: "pending_docs" | "pending_verification" | "verified" | "suspended" | "rejected";
  status_reason?: string;
  vehicle_info?: VehicleInfo | null;
  is_online?: boolean;
}

interface AuthState {
  user: User | null;
  role: "customer" | "driver" | "admin" | null;
  login: (user: AuthState["user"], role: AuthState["role"], tokens?: { access: string; refresh: string }) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      login: (user, role, tokens) => {
        if (tokens) {
          localStorage.setItem("access_token", tokens.access);
          localStorage.setItem("refresh_token", tokens.refresh);
        }
        set({ user, role });
      },
      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({ user: null, role: null });
      },
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
    }),
    {
      name: "auth-storage",
    }
  )
);
