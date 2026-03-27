"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ActivityType } from "@dshow/shared";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { canAccessPath, getAuthorizedFallbackPath } from "@/lib/permissions";
import { useAppStore } from "@/store/app-store";

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (!activeContext.companyId || !activeContext.activityId) {
      router.replace("/select-activity");
      return;
    }

    if (activeContext.activityType && activeContext.activityType !== ActivityType.RESTAURANT) {
      router.replace("/select-activity");
      return;
    }

    const allowed = canAccessPath({
      pathname,
      user,
      activityId: activeContext.activityId,
      activityType: activeContext.activityType,
    });

    if (!allowed) {
      router.replace(
        getAuthorizedFallbackPath({
          user,
          activityId: activeContext.activityId,
          activityType: activeContext.activityType,
        }),
      );
    }
  }, [accessToken, activeContext.activityId, activeContext.activityType, activeContext.companyId, hasHydrated, pathname, router, user]);

  if (!hasHydrated || !accessToken || !activeContext.companyId || !activeContext.activityId) {
    return null;
  }

  const allowed = canAccessPath({
    pathname,
    user,
    activityId: activeContext.activityId,
    activityType: activeContext.activityType,
  });

  if (!allowed) {
    return null;
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>
        <div className="grid gap-4">
          <Topbar />
          {children}
        </div>
      </div>
    </main>
  );
}
