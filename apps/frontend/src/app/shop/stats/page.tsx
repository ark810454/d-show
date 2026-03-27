"use client";

import { useEffect, useState } from "react";
import { ShopStatsPanel } from "@/components/shop/shop-stats-panel";
import { shopService } from "@/services/shop-service";

export default function ShopStatsPage() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    shopService.stats().then(setStats).catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <ShopStatsPanel stats={stats} />
      </div>
    </main>
  );
}
