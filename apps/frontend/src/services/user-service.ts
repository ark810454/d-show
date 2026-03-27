import { apiClient } from "@/lib/api";

export interface UserAssignmentItem {
  id?: string;
  activityId: string;
  roleId: string;
  role?: { id: string; nom: string };
  activity?: { id: string; nom: string; type: string };
}

export interface UserItem {
  id: string;
  companyId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  photo?: string | null;
  statut: string;
  assignments: UserAssignmentItem[];
}

export interface CreateUserPayload {
  companyId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  motDePasse: string;
  photo?: string;
  statut?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  assignments: Array<{ activityId: string; roleId: string }>;
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  motDePasse?: string;
  photo?: string;
  statut?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export const userService = {
  async list(companyId: string, activityId?: string) {
    const { data } = await apiClient.get<UserItem[]>("/users", {
      headers: {
        "x-company-id": companyId,
        ...(activityId ? { "x-activity-id": activityId } : {}),
      },
    });
    return data;
  },
  async me() {
    const { data } = await apiClient.get<UserItem>("/users/me/profile");
    return data;
  },
  async updateMe(payload: UpdateUserPayload) {
    const { data } = await apiClient.patch<UserItem>("/auth/me", payload);
    return data;
  },
  async create(payload: CreateUserPayload) {
    const { data } = await apiClient.post<UserItem>("/users", payload, {
      headers: { "x-company-id": payload.companyId },
    });
    return data;
  },
  async update(id: string, companyId: string, payload: UpdateUserPayload) {
    const { data } = await apiClient.patch<UserItem>(`/users/${id}`, payload, {
      headers: { "x-company-id": companyId },
    });
    return data;
  },
  async deactivate(id: string, companyId: string) {
    const { data } = await apiClient.patch<UserItem>(
      `/users/${id}/deactivate`,
      {},
      { headers: { "x-company-id": companyId } },
    );
    return data;
  },
  async remove(id: string, companyId: string) {
    const { data } = await apiClient.delete<UserItem>(`/users/${id}`, {
      headers: { "x-company-id": companyId },
    });
    return data;
  },
  async assignRoles(id: string, companyId: string, assignments: Array<{ activityId: string; roleId: string }>) {
    const { data } = await apiClient.patch<UserItem>(
      `/users/${id}/assignments`,
      { assignments },
      { headers: { "x-company-id": companyId } },
    );
    return data;
  },
  async performance(userId: string, companyId: string, activityId?: string) {
    const { data } = await apiClient.get(`/users/${userId}/performance`, {
      headers: {
        "x-company-id": companyId,
        ...(activityId ? { "x-activity-id": activityId } : {}),
      },
    });
    return data;
  },
  async clockIn(activityId?: string, note?: string) {
    const { data } = await apiClient.post("/users/me/clock-in", { activityId, note });
    return data;
  },
  async clockOut(activityId?: string, note?: string) {
    const { data } = await apiClient.post("/users/me/clock-out", { activityId, note });
    return data;
  },
};
