"use client";

import { RestaurantStatusPill } from "./status-pill";

export function KitchenBoard({
  tickets,
  onChangeStatus,
}: {
  tickets: any[];
  onChangeStatus: (id: string, status: string) => Promise<void>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => (
        <article key={ticket.id} className="surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{ticket.code}</p>
              <h3 className="mt-2 font-display text-2xl text-ink">{ticket.restaurantOrder.table?.nom ?? ticket.restaurantOrder.table?.code}</h3>
            </div>
            <RestaurantStatusPill value={ticket.statut} />
          </div>
          <div className="mt-5 grid gap-2">
            {ticket.restaurantOrder.items.map((item: any) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {item.quantite}x {item.libelle}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["EN_ATTENTE", "EN_PREPARATION", "PRET", "SERVI", "ANNULE"].map((status) => (
              <button key={status} onClick={() => void onChangeStatus(ticket.id, status)} className="rounded-2xl bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                {status}
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

