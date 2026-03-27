"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActivityType } from "@dshow/shared";
import axios from "axios";
import { ShopPos } from "@/components/shop/shop-pos";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { shopService } from "@/services/shop-service";
import { useAppStore } from "@/store/app-store";

export default function ShopPosPage() {
  const router = useRouter();
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(query?: string) {
    try {
      setLoading(true);
      const data = await shopService.products(query);
      setProducts(data);
      setError(null);
    } catch {
      setError("Impossible de charger les produits de la boutique.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeContext.activityType && activeContext.activityType !== ActivityType.SHOP) {
      router.replace("/select-activity");
      return;
    }
    void load();
  }, [activeContext.activityType, router]);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {error ? <div className="mb-4"><InlineFeedback tone="error">{error}</InlineFeedback></div> : null}
        {loading ? <SectionSkeleton cards={3} lines={2} /> : null}
        {!loading ? <ShopPos
          products={products}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          userId={user?.id}
          onSearch={(query) => void load(query)}
          onSubmit={async (payload) => {
            try {
              await shopService.createSale(payload);
              await load();
              setError(null);
            } catch (error) {
              if (axios.isAxiosError(error) && error.response?.data?.message) {
                setError(
                  Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(", ")
                    : String(error.response.data.message),
                );
              } else {
                setError("Impossible de valider la vente boutique.");
              }
            }
          }}
        />
        : null}
      </div>
    </main>
  );
}
