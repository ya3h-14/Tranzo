import { create } from "zustand";

interface UIState {
  isLoading: boolean;
  modals: Record<string, boolean>;
  setLoading: (loading: boolean) => void;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  modals: {},
  setLoading: (loading) => set({ isLoading: loading }),
  openModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: true } })),
  closeModal: (id) => set((state) => ({ modals: { ...state.modals, [id]: false } })),
}));
