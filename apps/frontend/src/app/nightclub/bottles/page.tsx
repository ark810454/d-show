"use client";

import axios from "axios";
import { ActivityType } from "@dshow/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottlePos } from "@/components/nightclub/bottle-pos";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { useNightclubSocket } from "@/hooks/nightclub/use-nightclub-socket";
import { nightclubService } from "@/services/nightclub-service";
import { useAppStore } from "@/store/app-store";

export default function NightclubBottlesPage() {
  const router = useRouter();
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [menu, setMenu] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [menuData, zoneData, orderData] = await Promise.all([
        nightclubService.bottleMenu(),
        nightclubService.zones(),
        nightclubService.bottleOrders(),
      ]);
      setMenu(menuData);
      setZones(zoneData);
      setOrders(orderData);
      setError(null);
    } catch {
      setError("Impossible de charger le module bouteilles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeContext.activityType && activeContext.activityType !== ActivityType.BOITE_NUIT) {
      router.replace("/select-activity");
      return;
    }
    void load();
  }, [activeContext.activityType, router]);

  useNightclubSocket({
    "nightclub.bottle.updated": () => void load(),
    "nightclub.reservation.updated": () => void load(),
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#020617,#111827)] p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {error ? <div className="mb-4"><InlineFeedback tone="error">{error}</InlineFeedback></div> : null}
        {loading ? <SectionSkeleton cards={3} lines={2} /> : null}
        {!loading ? <BottlePos
          menu={menu}
          zones={zones}
          orders={orders}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          userId={user?.id}
          onCreateOrder={async (payload) => {
            try {
              await nightclubService.createBottleOrder(payload);
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
                setError("Impossible d'envoyer la commande de bouteilles.");
              }
            }
          }}
          onPay={async (payload) => {
            try {
              await nightclubService.createBottlePayment(payload);
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
                setError("Impossible d'encaisser cette commande.");
              }
            }
          }}
        />
        : null}
      </div>
    </main>
  );
}
