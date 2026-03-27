"use client";

import { useEffect, useState } from "react";
import { TableGrid } from "@/components/restaurant/table-grid";
import { Button } from "@/components/ui/button";
import { restaurantService } from "@/services/restaurant-service";
import { useAppStore } from "@/store/app-store";
import { useRestaurantSocket } from "@/hooks/restaurant/use-restaurant-socket";

export default function RestaurantTablesPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const [tables, setTables] = useState<any[]>([]);

  async function loadTables() {
    const data = await restaurantService.tables();
    setTables(data);
  }

  useEffect(() => {
    void loadTables();
  }, []);

  useRestaurantSocket({
    "restaurant.table.updated": () => void loadTables(),
    "restaurant.order.created": () => void loadTables(),
  });

  async function createDemoTable() {
    if (!activeContext.companyId || !activeContext.activityId) return;
    await restaurantService.createTable({
      companyId: activeContext.companyId,
      activityId: activeContext.activityId,
      code: `T-${tables.length + 1}`,
      nom: `Table ${tables.length + 1}`,
      capacite: 4,
    });
    await loadTables();
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Restaurant</p>
            <h1 className="mt-2 font-display text-4xl text-ink">Vue salle & tables</h1>
          </div>
          <Button onClick={createDemoTable}>Ajouter une table</Button>
        </section>
        <TableGrid tables={tables} onStatusChange={(id, statut) => void restaurantService.updateTableStatus(id, statut).then(loadTables)} />
      </div>
    </main>
  );
}

