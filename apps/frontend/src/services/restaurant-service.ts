import { apiClient } from "@/lib/api";
import { getRealtimeSocket } from "@/lib/realtime";

export const restaurantService = {
  async tables() {
    const { data } = await apiClient.get("/restaurant/tables");
    return data;
  },
  async createTable(payload: {
    companyId: string;
    activityId: string;
    code: string;
    nom?: string;
    capacite: number;
  }) {
    const { data } = await apiClient.post("/restaurant/tables", payload);
    return data;
  },
  async updateTableStatus(id: string, statut: string) {
    const { data } = await apiClient.patch(`/restaurant/tables/${id}/status`, { statut });
    return data;
  },
  async menu() {
    const { data } = await apiClient.get("/restaurant/menu");
    return data;
  },
  async createCategory(payload: { companyId: string; activityId: string; nom: string; description?: string }) {
    const { data } = await apiClient.post("/restaurant/menu/categories", payload);
    return data;
  },
  async createMenuItem(payload: {
    companyId: string;
    activityId: string;
    categoryId: string;
    nom: string;
    prix: number;
    description?: string;
    image?: string;
    options?: Array<{ nom: string; prix: number }>;
  }) {
    const { data } = await apiClient.post("/restaurant/menu/items", payload);
    return data;
  },
  async updateMenuItem(
    id: string,
    payload: {
      companyId?: string;
      activityId?: string;
      categoryId?: string;
      nom?: string;
      prix?: number;
      description?: string;
      image?: string;
      statut?: string;
      options?: Array<{ nom: string; prix: number }>;
    },
  ) {
    const { data } = await apiClient.patch(`/restaurant/menu/items/${id}`, payload);
    return data;
  },
  async orders() {
    const { data } = await apiClient.get("/restaurant/orders");
    return data;
  },
  async createOrder(payload: any) {
    const { data } = await apiClient.post("/restaurant/orders", payload);
    return data;
  },
  async kitchenBoard() {
    const { data } = await apiClient.get("/restaurant/kitchen");
    return data;
  },
  async updateKitchenStatus(id: string, statutCuisine: string, handledByUserId?: string) {
    const { data } = await apiClient.patch(`/restaurant/kitchen/${id}/status`, {
      statutCuisine,
      handledByUserId,
    });
    return data;
  },
  async createPayment(payload: any) {
    const { data } = await apiClient.post("/restaurant/payments", payload);
    return data;
  },
  async stats(params?: { from?: string; to?: string }) {
    const { data } = await apiClient.get("/restaurant/stats", { params });
    return data;
  },
  socket() {
    return getRealtimeSocket();
  },
};
