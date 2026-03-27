"use client";

import { activitySummary, mockKpis, operationalRows } from "@/services/dashboard-service";

export function useDashboard() {
  return {
    kpis: mockKpis,
    activities: activitySummary,
    operations: operationalRows,
  };
}
