"use client";

import { useEffect, useState } from "react";
import { VipBoard } from "@/components/nightclub/vip-board";
import { useNightclubSocket } from "@/hooks/nightclub/use-nightclub-socket";
import { nightclubService } from "@/services/nightclub-service";

export default function NightclubVipPage() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const response = await nightclubService.vip();
    setData(response);
  }

  useEffect(() => {
    void load();
  }, []);

  useNightclubSocket({
    "nightclub.ticket.validated": () => void load(),
    "nightclub.reservation.updated": () => void load(),
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#111827)] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <VipBoard data={data} />
      </div>
    </main>
  );
}
