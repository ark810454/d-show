"use client";

import { useEffect, useState } from "react";
import { TerraceCashier } from "@/components/terrace/terrace-cashier";
import { terraceService } from "@/services/terrace-service";
import { useAppStore } from "@/store/app-store";
import { useTerraceSocket } from "@/hooks/terrace/use-terrace-socket";

export default function TerraceCashierPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [orders, setOrders] = useState<any[]>([]);

  async function load() {
    const data = await terraceService.orders();
    setOrders(data);
  }

  useEffect(() => {
    void load();
  }, []);

  useTerraceSocket({
    "terrace.order.created": () => void load(),
    "terrace.payment.created": () => void load(),
    "terrace.order.status": () => void load(),
  });

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <TerraceCashier
          orders={orders}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          userId={user?.id}
          onPay={async (payload) => {
            await terraceService.createPayment(payload);
            await load();
          }}
        />
      </div>
    </main>
  );
}

