import type { CompanySummary } from "@dshow/shared";
import { apiClient } from "@/lib/api";

export interface CreateCompanyPayload {
  nom: string;
  raisonSociale?: string;
  rccm?: string;
  idNat?: string;
  numeroImpot?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  logo?: string;
}

export const companyService = {
  async getAuthorized() {
    const { data } = await apiClient.get<CompanySummary[]>("/companies/authorized");
    return data;
  },
  async getById(id: string) {
    const { data } = await apiClient.get<CompanySummary>(`/companies/${id}`);
    return data;
  },
  async create(payload: CreateCompanyPayload) {
    const { data } = await apiClient.post<CompanySummary>("/companies", payload);
    return data;
  },
  async updateStatus(id: string, statut: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED") {
    const { data } = await apiClient.patch<CompanySummary>(`/companies/${id}/status`, { statut });
    return data;
  },
};

