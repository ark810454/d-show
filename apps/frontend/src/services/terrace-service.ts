import { apiClient } from "@/lib/api";
import { getRealtimeSocket } from "@/lib/realtime";

export const terraceService = {
  async tables() {
    const { data } = await apiClient.get("/terrace/tables");
    return data;
  },
  async createTable(payload: any) {
    const { data } = await apiClient.post("/terrace/tables", payload);
    return data;
  },
  async updateTableStatus(id: string, statut: string) {
    const { data } = await apiClient.patch(`/terrace/tables/${id}/status`, { statut });
    return data;
  },
  async menu() {
    const { data } = await apiClient.get("/terrace/menu");
    return data;
  },
  async createCategory(payload: any) {
    const { data } = await apiClient.post("/terrace/menu/categories", payload);
    return data;
  },
  async createItem(payload: any) {
    const { data } = await apiClient.post("/terrace/menu/items", payload);
    return data;
  },
  async happyHours() {
    const { data } = await apiClient.get("/terrace/happy-hours");
    return data;
  },
  async createHappyHour(payload: any) {
    const { data } = await apiClient.post("/terrace/happy-hours", payload);
    return data;
  },
  async orders() {
    const { data } = await apiClient.get("/terrace/orders");
    return data;
  },
  async createOrder(payload: any) {
    const { data } = await apiClient.post("/terrace/orders", payload);
    return data;
  },
  async updateOrderStatus(id: string, statut: string) {
    const { data } = await apiClient.patch(`/terrace/orders/${id}/status`, { statut });
    return data;
  },
  async createPayment(payload: any) {
    const { data } = await apiClient.post("/terrace/payments", payload);
    return data;
  },
  async stats() {
    const { data } = await apiClient.get("/terrace/stats");
    return data;
  },
  socket() {
    return getRealtimeSocket();
  },
};
