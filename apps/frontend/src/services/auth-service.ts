import { apiClient } from "@/lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    companyId: string;
    company?: {
      id: string;
      nom: string;
    };
    assignments: Array<{
      id?: string;
      activityId: string;
      roleId: string;
      role?: { id: string; nom: string };
      activity?: { id: string; nom: string; type: string };
    }>;
  };
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
    return data;
  },
  async logout() {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },
  async refresh(refreshToken: string) {
    const { data } = await apiClient.post("/auth/refresh", { refreshToken });
    return data;
  },
  async me() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};
