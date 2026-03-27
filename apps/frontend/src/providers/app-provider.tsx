"use client";

import { useEffect } from "react";
import { clearAllSessionCookies, syncSessionCookies } from "@/lib/session";
import { RouteAccessGuard } from "@/providers/route-access-guard";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { useAppStore } from "@/store/app-store";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);

  useEffect(() => {
    if (!accessToken) {
      clearAllSessionCookies();
      return;
    }

    syncSessionCookies({
      accessToken,
      companyId: activeContext.companyId,
      activityId: activeContext.activityId,
    });
  }, [accessToken, activeContext.activityId, activeContext.companyId]);

  return (
    <RealtimeProvider>
      <RouteAccessGuard>{children}</RouteAccessGuard>
    </RealtimeProvider>
  );
}
