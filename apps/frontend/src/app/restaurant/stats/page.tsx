"use client";

import { useEffect, useState } from "react";
import { RestaurantStatsPanel } from "@/components/restaurant/restaurant-stats-panel";
import { restaurantService } from "@/services/restaurant-service";

export default function RestaurantStatsPage() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    restaurantService.stats().then(setStats).catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Restaurant</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Statistiques restaurant</h1>
        </section>
        <RestaurantStatsPanel stats={stats} />
      </div>
    </main>
  );
}
