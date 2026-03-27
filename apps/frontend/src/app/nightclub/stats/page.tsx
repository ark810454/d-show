"use client";

import { useEffect, useState } from "react";
import { NightclubStatsPanel } from "@/components/nightclub/nightclub-stats-panel";
import { nightclubService } from "@/services/nightclub-service";

export default function NightclubStatsPage() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    nightclubService.stats().then(setStats).catch(() => undefined);
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#111827)] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <NightclubStatsPanel stats={stats} />
      </div>
    </main>
  );
}
