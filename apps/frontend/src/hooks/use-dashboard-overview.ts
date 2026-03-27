"use client";

import { useEffect, useState } from "react";
import type { DashboardOverview } from "@dshow/shared";
import { dashboardService, mockDashboardOverview, type DashboardFilters } from "@/services/dashboard-service";

export function useDashboardOverview(filters: DashboardFilters) {
  const [data, setData] = useState<DashboardOverview>(mockDashboardOverview);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    dashboardService
      .getOverview(filters)
      .then((response) => {
        if (mounted) {
          setData(response);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [filters.activityId, filters.from, filters.to]);

  return { data, loading };
}

