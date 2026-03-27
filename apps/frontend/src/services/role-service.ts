import { apiClient } from "@/lib/api";

export interface RoleItem {
  id: string;
  nom: string;
  description?: string | null;
}

export const roleService = {
  async list() {
    const { data } = await apiClient.get<RoleItem[]>("/roles");
    return data;
  },
};

