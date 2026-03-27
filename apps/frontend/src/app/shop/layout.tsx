"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ActivityType } from "@dshow/shared";
import { canAccessPath, getAuthorizedFallbackPath } from "@/lib/permissions";
import { useAppStore } from "@/store/app-store";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
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
    if (activeContext.activityType && activeContext.activityType !== ActivityType.SHOP) {
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
  }, [
    accessToken,
    activeContext.activityId,
    activeContext.activityType,
    activeContext.companyId,
    hasHydrated,
    pathname,
    router,
    user,
  ]);

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

  return <>{children}</>;
}
