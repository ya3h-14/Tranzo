import { create } from "zustand";

interface DriverState {
  isOnline: boolean;
  activeDelivery: string | null;
  toggleOnline: () => void;
  setActiveDelivery: (id: string | null) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  isOnline: false,
  activeDelivery: null,
  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),
  setActiveDelivery: (id) => set({ activeDelivery: id }),
}));
