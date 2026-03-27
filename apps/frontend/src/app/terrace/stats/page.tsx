"use client";

import { useEffect, useState } from "react";
import { PromotionBanner } from "@/components/terrace/promotion-banner";
import { TerraceStatsPanel } from "@/components/terrace/terrace-stats-panel";
import { terraceService } from "@/services/terrace-service";

export default function TerraceStatsPage() {
  const [stats, setStats] = useState<any>({});
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    terraceService.stats().then(setStats).catch(() => undefined);
    terraceService.happyHours().then(setPromotions).catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <PromotionBanner promotions={promotions} />
        <TerraceStatsPanel stats={stats} />
      </div>
    </main>
  );
}
