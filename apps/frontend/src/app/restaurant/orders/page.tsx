"use client";

import { useEffect, useState } from "react";
import { OrderBuilder } from "@/components/restaurant/order-builder";
import { restaurantService } from "@/services/restaurant-service";
import { useAppStore } from "@/store/app-store";

export default function RestaurantOrdersPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [tables, setTables] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    restaurantService.tables().then(setTables).catch(() => undefined);
    restaurantService.menu().then(setMenu).catch(() => undefined);
  }, []);

  async function handleSubmit(payload: any) {
    await restaurantService.createOrder(payload);
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Restaurant</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Prise de commande</h1>
        </section>
        <OrderBuilder
          tables={tables}
          menu={menu}
          serverId={user?.id}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}

