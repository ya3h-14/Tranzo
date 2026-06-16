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
            pickup: "123 Main St, NY",
            drop: "456 Market St, NY",
            goodsType: "Electronics",
            weight: 50,
            status: "completed",
            price: 120,
            date: "2023-10-25",
            vehicle: "Mini Truck",
            distance: 12.5,
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
          date: new Date().toISOString(),
        } as Order);
      }, 1000);
    });
    // return apiClient.post("/orders", data).then((res) => res.data);
  },
};
