import type { ActivitySummary, ActivityType } from "@dshow/shared";
import { apiClient } from "@/lib/api";

export interface CreateActivityPayload {
  companyId: string;
  nom: string;
  code?: string;
  type: ActivityType;
  description?: string;
}

export const activityService = {
  async listByCompany(companyId: string) {
    const { data } = await apiClient.get<ActivitySummary[]>(`/activities/company/${companyId}`);
    return data;
  },
  async getById(id: string) {
    const { data } = await apiClient.get<ActivitySummary>(`/activities/${id}`);
    return data;
  },
  async create(payload: CreateActivityPayload) {
    const { data } = await apiClient.post<ActivitySummary>("/activities", payload);
    return data;
  },
  async updateStatus(id: string, statut: "ACTIVE" | "INACTIVE") {
    const { data } = await apiClient.patch<ActivitySummary>(`/activities/${id}/status`, { statut });
    return data;
  },
};

