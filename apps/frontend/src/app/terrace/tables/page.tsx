"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TerraceTableGrid } from "@/components/terrace/terrace-table-grid";
import { terraceService } from "@/services/terrace-service";
import { useAppStore } from "@/store/app-store";
import { useTerraceSocket } from "@/hooks/terrace/use-terrace-socket";

export default function TerraceTablesPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const [tables, setTables] = useState<any[]>([]);

  async function load() {
    const data = await terraceService.tables();
    setTables(data);
  }

  useEffect(() => {
    void load();
  }, []);

  useTerraceSocket({
    "terrace.table.updated": () => void load(),
    "terrace.order.created": () => void load(),
  });

  async function createArea() {
    if (!activeContext.companyId || !activeContext.activityId) return;
    await terraceService.createTable({
      companyId: activeContext.companyId,
      activityId: activeContext.activityId,
      code: `Z-${tables.length + 1}`,
      nom: `Zone ${tables.length + 1}`,
      capacite: 4,
      emplacement: "Exterieur",
    });
    await load();
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Terrasse</p>
            <h1 className="mt-2 font-display text-4xl text-ink">Espaces exterieurs</h1>
          </div>
          <Button onClick={createArea}>Ajouter une zone</Button>
        </section>
        <TerraceTableGrid tables={tables} onStatusChange={(id, statut) => void terraceService.updateTableStatus(id, statut).then(load)} />
      </div>
    </main>
  );
}

