"use client";

import { useEffect, useState } from "react";
import { KitchenBoard } from "@/components/restaurant/kitchen-board";
import { restaurantService } from "@/services/restaurant-service";
import { useAppStore } from "@/store/app-store";
import { useRestaurantSocket } from "@/hooks/restaurant/use-restaurant-socket";

export default function RestaurantKitchenPage() {
  const user = useAppStore((state) => state.user);
  const [tickets, setTickets] = useState<any[]>([]);

  async function loadTickets() {
    const data = await restaurantService.kitchenBoard();
    setTickets(data);
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  useRestaurantSocket({
    "restaurant.kitchen.created": () => void loadTickets(),
    "restaurant.kitchen.status": () => void loadTickets(),
  });

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Cuisine</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Dashboard cuisine</h1>
        </section>
        <KitchenBoard
          tickets={tickets}
          onChangeStatus={(id, status) =>
            restaurantService.updateKitchenStatus(id, status, user?.id).then(loadTickets)
          }
        />
      </div>
    </main>
  );
}

