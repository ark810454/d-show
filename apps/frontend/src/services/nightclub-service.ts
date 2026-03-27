import { apiClient } from "@/lib/api";
import { getRealtimeSocket } from "@/lib/realtime";

export const nightclubService = {
  async dashboard() {
    const { data } = await apiClient.get("/nightclub/dashboard");
    return data;
  },
  async zones() {
    const { data } = await apiClient.get("/nightclub/zones");
    return data;
  },
  async createZone(payload: any) {
    const { data } = await apiClient.post("/nightclub/zones", payload);
    return data;
  },
  async updateZoneStatus(id: string, statut: string) {
    const { data } = await apiClient.patch(`/nightclub/zones/${id}/status`, { statut });
    return data;
  },
  async events() {
    const { data } = await apiClient.get("/nightclub/events");
    return data;
  },
  async createEvent(payload: any) {
    const { data } = await apiClient.post("/nightclub/events", payload);
    return data;
  },
  async tickets() {
    const { data } = await apiClient.get("/nightclub/tickets");
    return data;
  },
  async createTicket(payload: any) {
    const { data } = await apiClient.post("/nightclub/tickets", payload);
    return data;
  },
  async validateTicket(payload: any) {
    const { data } = await apiClient.post("/nightclub/tickets/validate", payload);
    return data;
  },
  async bookings() {
    const { data } = await apiClient.get("/nightclub/bookings");
    return data;
  },
  async createBooking(payload: any) {
    const { data } = await apiClient.post("/nightclub/bookings", payload);
    return data;
  },
  async updateBookingStatus(id: string, statut: string) {
    const { data } = await apiClient.patch(`/nightclub/bookings/${id}/status`, { statut });
    return data;
  },
  async bottleMenu() {
    const { data } = await apiClient.get("/nightclub/bottles/menu");
    return data;
  },
  async createBottleCategory(payload: any) {
    const { data } = await apiClient.post("/nightclub/bottles/categories", payload);
    return data;
  },
  async createBottleItem(payload: any) {
    const { data } = await apiClient.post("/nightclub/bottles/items", payload);
    return data;
  },
  async bottleOrders() {
    const { data } = await apiClient.get("/nightclub/bottle-orders");
    return data;
  },
  async createBottleOrder(payload: any) {
    const { data } = await apiClient.post("/nightclub/bottle-orders", payload);
    return data;
  },
  async updateBottleOrderStatus(id: string, statut: string) {
    const { data } = await apiClient.patch(`/nightclub/bottle-orders/${id}/status`, { statut });
    return data;
  },
  async createBottlePayment(payload: any) {
    const { data } = await apiClient.post("/nightclub/bottle-payments", payload);
    return data;
  },
  async vip() {
    const { data } = await apiClient.get("/nightclub/vip");
    return data;
  },
  async stats() {
    const { data } = await apiClient.get("/nightclub/stats");
    return data;
  },
  socket() {
    return getRealtimeSocket();
  },
};
