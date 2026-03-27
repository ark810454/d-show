"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActivityType } from "@dshow/shared";
import axios from "axios";
import { LowStockWidget } from "@/components/shop/low-stock-widget";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { canAccessPath } from "@/lib/permissions";
import { shopService } from "@/services/shop-service";
import { useAppStore } from "@/store/app-store";

export default function ShopInventoryPage() {
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (!activeContext.companyId) {
      router.replace("/select-company");
      return;
    }
    if (!activeContext.activityId || activeContext.activityType !== ActivityType.SHOP) {
      router.replace("/select-activity");
      return;
    }
    if (
      !canAccessPath({
        pathname: "/shop/inventory",
        user,
        activityId: activeContext.activityId,
        activityType: activeContext.activityType,
      })
    ) {
      router.replace("/select-activity");
      return;
    }

    setLoading(true);
    Promise.all([shopService.lowStock(), shopService.stockMovements()])
      .then(([lowStockData, movementData]) => {
        setLowStock(lowStockData);
        setMovements(movementData);
        setError(null);
      })
      .catch((loadError) => {
        if (axios.isAxiosError(loadError) && loadError.response?.data?.message) {
          setError(
            Array.isArray(loadError.response.data.message)
              ? loadError.response.data.message.join(", ")
              : String(loadError.response.data.message),
          );
          return;
        }
        setError("Impossible de charger l'inventaire de la boutique.");
      })
      .finally(() => setLoading(false));
  }, [hasHydrated, accessToken, activeContext.companyId, activeContext.activityId, activeContext.activityType, router, user]);

  if (
    !hasHydrated ||
    !accessToken ||
    !activeContext.companyId ||
    !activeContext.activityId ||
    !canAccessPath({
      pathname: "/shop/inventory",
      user,
      activityId: activeContext.activityId,
      activityType: activeContext.activityType,
    })
  ) {
    return (
      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto grid max-w-7xl gap-6">
          <SectionSkeleton cards={3} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        {error ? (
          <InlineFeedback tone="error">
            <p className="font-semibold">Inventaire indisponible</p>
            <p className="mt-1">{error}</p>
          </InlineFeedback>
        ) : null}
        {loading ? <SectionSkeleton cards={3} /> : null}
        {!loading ? (
          <>
        <LowStockWidget items={lowStock} />
        <section className="surface p-5">
          <h3 className="font-display text-2xl text-ink">Mouvements de stock</h3>
          <div className="mt-4 grid gap-3">
            {movements.map((movement) => (
              <div key={movement.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-700">{movement.product?.nom}</p>
                  <span className="text-sm text-slate-500">{movement.typeMouvement}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">Quantite: {movement.quantite}</p>
              </div>
            ))}
          </div>
        </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
