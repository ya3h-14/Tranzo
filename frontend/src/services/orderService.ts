import { apiClient } from "./apiClient";
import { Order } from "@/store/orderStore";

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "ORD-001",
            pickup_address: "123 Main St, NY",
            dropoff_address: "456 Market St, NY",
            package_details: "Electronics - 50kg",
            status: "delivered",
            price: 120,
            created_at: "2023-10-25",
            vehicle_requested: "Mini Truck",
            distance_km: 12.5,
          },
        ]);
      }, 1000);
    });
    // return apiClient.get("/orders").then((res) => res.data);
  },
  
  createOrder: async (data: Partial<Order>): Promise<Order> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...data,
          id: `ORD-${Math.floor(Math.random() * 1000)}`,
          status: "pending",
          created_at: new Date().toISOString(),
        } as Order);
      }, 1000);
    });
    // return apiClient.post("/orders", data).then((res) => res.data);
  },
};
