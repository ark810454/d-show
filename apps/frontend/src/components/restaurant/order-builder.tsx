"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export function OrderBuilder({
  tables,
  menu,
  serverId,
  companyId,
  activityId,
  onSubmit,
}: {
  tables: any[];
  menu: any[];
  serverId?: string;
  companyId?: string | null;
  activityId?: string | null;
  onSubmit: (payload: any) => Promise<void>;
}) {
  const [selectedTableId, setSelectedTableId] = useState("");
  const [notesCuisine, setNotesCuisine] = useState("");
  const [items, setItems] = useState<Array<any>>([]);

  const flatItems = useMemo(() => menu.flatMap((category: any) => category.items), [menu]);
  const total = items.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0);

  function addItem(item: any) {
    setItems((current) => {
      const existing = current.find((entry) => entry.menuItemId === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.menuItemId === item.id ? { ...entry, quantite: entry.quantite + 1 } : entry,
        );
      }
      return [
        ...current,
        {
          menuItemId: item.id,
          libelle: item.nom,
          quantite: 1,
          prixUnitaire: Number(item.prix),
        },
      ];
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {flatItems.map((item: any) => (
          <button key={item.id} onClick={() => addItem(item)} className="surface p-5 text-left hover:-translate-y-1 transition">
            <p className="font-semibold text-slate-800">{item.nom}</p>
            <p className="mt-2 text-sm text-slate-500">{item.description ?? "Article du menu"}</p>
            <p className="mt-4 text-sm font-semibold text-pine">{Number(item.prix).toLocaleString("fr-FR")} FCFA</p>
          </button>
        ))}
      </section>
      <section className="surface h-fit p-5">
        <h3 className="font-display text-3xl text-ink">Commande</h3>
        <div className="mt-4 grid gap-3">
          <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none">
            <option value="">Choisir une table</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.nom ?? table.code}
              </option>
            ))}
          </select>
          <textarea value={notesCuisine} onChange={(e) => setNotesCuisine(e.target.value)} placeholder="Notes cuisine" className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        </div>
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div key={item.menuItemId} className="rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-700">{item.libelle}</p>
                <p className="text-sm text-slate-500">x{item.quantite}</p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{(item.quantite * item.prixUnitaire).toLocaleString("fr-FR")} FCFA</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total</span>
          <span className="font-display text-3xl text-ink">{total.toLocaleString("fr-FR")} FCFA</span>
        </div>
        <Button
          className="mt-5 w-full bg-pine hover:bg-teal-800"
          disabled={!selectedTableId || !items.length || !serverId || !companyId || !activityId}
          onClick={() =>
            onSubmit({
              companyId,
              activityId,
              tableId: selectedTableId,
              serverId,
              notesCuisine,
              items,
            })
          }
        >
          Envoyer en cuisine
        </Button>
      </section>
    </div>
  );
}

