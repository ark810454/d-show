import { apiClient } from "@/lib/api";

export const shopService = {
  async categories() {
    const { data } = await apiClient.get("/shop/categories");
    return data;
  },
  async createCategory(payload: any) {
    const { data } = await apiClient.post("/shop/categories", payload);
    return data;
  },
  async products(q?: string) {
    const { data } = await apiClient.get("/shop/products", { params: { q } });
    return data;
  },
  async createProduct(payload: any) {
    const { data } = await apiClient.post("/shop/products", payload);
    return data;
  },
  async updateProduct(id: string, payload: any) {
    const { data } = await apiClient.patch(`/shop/products/${id}`, payload);
    return data;
  },
  async promotions() {
    const { data } = await apiClient.get("/shop/promotions");
    return data;
  },
  async createPromotion(payload: any) {
    const { data } = await apiClient.post("/shop/promotions", payload);
    return data;
  },
  async createSale(payload: any) {
    const { data } = await apiClient.post("/shop/sales", payload);
    return data;
  },
  async sales() {
    const { data } = await apiClient.get("/shop/sales");
    return data;
  },
  async lowStock() {
    const { data } = await apiClient.get("/shop/alerts/low-stock");
    return data;
  },
  async stockMovements() {
    const { data } = await apiClient.get("/shop/inventory/movements");
    return data;
  },
  async stats() {
    const { data } = await apiClient.get("/shop/stats");
    return data;
  },
};
