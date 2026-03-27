"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessPath, getAuthorizedFallbackPath } from "@/lib/permissions";
import { useAppStore } from "@/store/app-store";

const PUBLIC_PATHS = ["/login"];

export function RouteAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const isAllowed =
    isPublicPath ||
    !accessToken ||
    !hasHydrated ||
    canAccessPath({
      pathname,
      user,
      activityId: activeContext.activityId,
      activityType: activeContext.activityType,
    });

  useEffect(() => {
    if (!hasHydrated || !accessToken || isPublicPath || isAllowed) {
      return;
    }

    router.replace(
      getAuthorizedFallbackPath({
        user,
        activityId: activeContext.activityId,
        activityType: activeContext.activityType,
      }),
    );
  }, [
    accessToken,
    activeContext.activityId,
    activeContext.activityType,
    hasHydrated,
    isAllowed,
    isPublicPath,
    router,
    user,
  ]);

  if (!isAllowed && accessToken && hasHydrated) {
    return null;
  }

  return <>{children}</>;
}
