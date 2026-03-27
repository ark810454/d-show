"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formSelectClass, formTextareaClass } from "@/components/ui/form-styles";

export function TerracePos({
  menu,
  tables,
  companyId,
  activityId,
  userId,
  onSubmit,
}: {
  menu: any[];
  tables: any[];
  companyId?: string | null;
  activityId?: string | null;
  userId?: string;
  onSubmit: (payload: any) => Promise<void>;
}) {
  const [selectedTableId, setSelectedTableId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const flatItems = useMemo(() => menu.flatMap((category: any) => category.items), [menu]);
  const total = items.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0);

  function addItem(item: any) {
    setItems((current) => {
      const existing = current.find((entry) => entry.menuItemId === item.id);
      if (existing) {
        return current.map((entry) => entry.menuItemId === item.id ? { ...entry, quantite: entry.quantite + 1 } : entry);
      }
      return [...current, { menuItemId: item.id, libelle: item.nom, quantite: 1, prixUnitaire: Number(item.prix) }];
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {flatItems.map((item: any) => (
          <button key={item.id} onClick={() => addItem(item)} className="surface min-h-36 p-5 text-left transition hover:-translate-y-1">
            <p className="font-semibold text-slate-800">{item.nom}</p>
            <p className="mt-2 text-sm text-slate-500">{item.boissonUniquement ? "Boisson" : "Mixte"}</p>
            <p className="mt-4 font-display text-2xl text-pine">{Number(item.prix).toLocaleString("fr-FR")} FCFA</p>
          </button>
        ))}
      </section>
      <section className="surface h-fit p-5">
        <h3 className="font-display text-3xl text-ink">Ticket rapide</h3>
        <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)} className={`mt-4 w-full ${formSelectClass}`}>
          <option value="">Choisir une zone/table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>{table.nom ?? table.code}</option>
          ))}
        </select>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note rapide" className={`mt-3 w-full ${formTextareaClass}`} />
        <div className="mt-4 grid gap-2">
          {items.map((item) => (
            <div key={item.menuItemId} className="rounded-2xl bg-slate-50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">{item.libelle}</span>
                <span className="text-sm text-slate-500">x{item.quantite}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total</span>
          <span className="font-display text-3xl text-ink">{total.toLocaleString("fr-FR")} FCFA</span>
        </div>
        <Button
          className="mt-5 w-full bg-gold hover:bg-amber-600"
          disabled={!items.length || !companyId || !activityId}
          onClick={() => onSubmit({ companyId, activityId, serverId: userId, terraceTableId: selectedTableId || undefined, note, items })}
        >
          Valider la commande
        </Button>
      </section>
    </div>
  );
}
