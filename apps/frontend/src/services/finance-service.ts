import { apiClient } from "@/lib/api";

export type FinanceFilters = {
  from?: string;
  to?: string;
  activityId?: string;
  granularity?: string;
};

export const financeService = {
  async dashboard(filters: FinanceFilters = {}) {
    const { data } = await apiClient.get("/finance/dashboard", {
      params: filters,
      headers: filters.activityId ? undefined : { "x-skip-activity-scope": "true" },
    });
    return data;
  },
  async report(filters: FinanceFilters = {}) {
    const { data } = await apiClient.get("/finance/report", {
      params: filters,
      headers: filters.activityId ? undefined : { "x-skip-activity-scope": "true" },
    });
    return data;
  },
  async expenseCategories() {
    const { data } = await apiClient.get("/finance/expense-categories", {
      headers: { "x-skip-activity-scope": "true" },
    });
    return data;
  },
  async createExpenseCategory(payload: any) {
    const { data } = await apiClient.post("/finance/expense-categories", payload);
    return data;
  },
  async expenses(filters: FinanceFilters = {}) {
    const { data } = await apiClient.get("/finance/expenses", {
      params: filters,
      headers: filters.activityId ? undefined : { "x-skip-activity-scope": "true" },
    });
    return data;
  },
  async createExpense(payload: any) {
    const { data } = await apiClient.post("/finance/expenses", payload);
    return data;
  },
};
