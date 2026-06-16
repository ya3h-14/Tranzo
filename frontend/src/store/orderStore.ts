import { create } from "zustand";

export interface Order {
  id: number | string;
  pickup_address: string;
  dropoff_address: string;
  package_details: string;
  vehicle_requested: string;
  status: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";
  price: number | string;
  distance_km: number | string;
  created_at: string;
  driver_details?: {
    name: string;
    phone_number?: string;
  };
}

interface BookingData {
  pickup: string;
  drop: string;
  goodsType: string;
  weight: string;
  description: string;
  vehicleType?: string;
  price?: number;
  distance?: number;
}

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  bookingData: BookingData;
  setCurrentOrder: (order: Order | null) => void;
  setOrders: (orders: Order[]) => void;
  setBookingData: (data: Partial<BookingData>) => void;
  resetBookingData: () => void;
  updateOrderStatus: (id: number | string, status: Order["status"]) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  currentOrder: null,
  orders: [],
  bookingData: {
    pickup: "",
    drop: "",
    goodsType: "",
    weight: "",
    description: "",
  },
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setOrders: (orders) => set({ orders }),
  setBookingData: (data) =>
    set((state) => ({
      bookingData: { ...state.bookingData, ...data },
    })),
  resetBookingData: () =>
    set({
      bookingData: {
        pickup: "",
        drop: "",
        goodsType: "",
        weight: "",
        description: "",
      },
    }),
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      currentOrder:
        state.currentOrder?.id === id
          ? { ...state.currentOrder, status }
          : state.currentOrder,
    })),
}));
