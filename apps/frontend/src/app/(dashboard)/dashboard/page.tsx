 "use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getActivityHomePath } from "@/lib/activity-routing";
import { useAppStore } from "@/store/app-store";

export default function DashboardPage() {
  const router = useRouter();
  const activityType = useAppStore((state) => state.activeContext.activityType);

  useEffect(() => {
    if (activityType) {
      router.replace(getActivityHomePath(activityType));
    }
  }, [activityType, router]);

  return <DashboardShell />;
}
