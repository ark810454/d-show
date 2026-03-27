"use client";

import { RestaurantStatusPill } from "./status-pill";

export function TableGrid({
  tables,
  onStatusChange,
}: {
  tables: Array<any>;
  onStatusChange: (id: string, statut: string) => void;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tables.map((table) => (
        <article key={table.id} className="surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{table.code}</p>
              <h3 className="mt-2 font-display text-2xl text-ink">{table.nom ?? table.code}</h3>
            </div>
            <RestaurantStatusPill value={table.statut} />
          </div>
          <p className="mt-4 text-sm text-slate-500">Capacite: {table.capacite} places</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["LIBRE", "OCCUPEE", "RESERVEE", "EN_NETTOYAGE"].map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(table.id, status)}
                className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                {status}
              </button>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

