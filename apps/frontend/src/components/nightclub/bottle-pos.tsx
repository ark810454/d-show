"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { darkFormInputClass, darkFormPanelClass, darkFormSelectClass } from "@/components/ui/form-styles";

export function BottlePos({
  menu,
  zones,
  orders,
  companyId,
  activityId,
  userId,
  onCreateOrder,
  onPay,
}: {
  menu: any[];
  zones: any[];
  orders: any[];
  companyId?: string | null;
  activityId?: string | null;
  userId?: string;
  onCreateOrder: (payload: any) => Promise<void>;
  onPay: (payload: any) => Promise<void>;
}) {
  const [zoneId, setZoneId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const flatItems = useMemo(() => menu.flatMap((category: any) => category.items), [menu]);
  const total = items.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0);

  function addItem(item: any) {
    setItems((current) => {
      const existing = current.find((entry) => entry.bottleItemId === item.id);
      if (existing) {
        return current.map((entry) => entry.bottleItemId === item.id ? { ...entry, quantite: entry.quantite + 1 } : entry);
      }
      return [...current, { bottleItemId: item.id, libelle: item.nom, quantite: 1, prixUnitaire: Number(item.prix) }];
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {flatItems.map((item: any) => (
          <button key={item.id} onClick={() => addItem(item)} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#111827,#312e81)] p-5 text-left text-white transition hover:-translate-y-1">
            <p className="font-semibold">{item.nom}</p>
            <p className="mt-2 text-sm text-slate-300">{item.vipOnly ? "VIP only" : item.estPack ? "Pack" : "Bouteille"}</p>
            <p className="mt-4 font-display text-2xl text-fuchsia-300">{Number(item.prix).toLocaleString("fr-FR")} FCFA</p>
          </button>
        ))}
      </section>

      <section className="grid gap-6">
        <div className={darkFormPanelClass}>
          <h2 className="font-display text-3xl">Commande bouteilles</h2>
          <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={`mt-4 ${darkFormSelectClass}`}>
            <option value="">Selectionner une zone</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id} className="text-slate-950">{zone.nom}</option>
            ))}
          </select>
          <div className="mt-4 grid gap-2">
            {items.map((item) => (
              <div key={item.bottleItemId} className="rounded-2xl bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span>{item.libelle}</span>
                  <span>x{item.quantite}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-slate-400">Total</span>
            <span className="font-display text-3xl">{total.toLocaleString("fr-FR")} FCFA</span>
          </div>
          <Button className="mt-5 w-full bg-fuchsia-600 hover:bg-fuchsia-500" disabled={!companyId || !activityId || !items.length} onClick={() => onCreateOrder({ companyId, activityId, zoneId: zoneId || undefined, serverId: userId, items })}>
            Envoyer la commande
          </Button>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-5 text-white">
          <h3 className="font-display text-3xl">Encaissement rapide</h3>
          <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} className={`mt-4 ${darkFormSelectClass}`}>
            <option value="">Choisir une commande</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id} className="text-slate-950">{order.reference}</option>
            ))}
          </select>
          <input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Montant" className={`mt-3 ${darkFormInputClass}`} />
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`mt-3 ${darkFormSelectClass}`}>
            <option value="CASH">CASH</option>
            <option value="CARTE">CARTE</option>
            <option value="MOBILE_MONEY">MOBILE_MONEY</option>
          </select>
          <Button className="mt-4 w-full" disabled={!companyId || !activityId || !selectedOrderId || !paymentAmount} onClick={() => onPay({ companyId, activityId, bottleOrderId: selectedOrderId, processedByUserId: userId, montant: Number(paymentAmount), modePaiement: paymentMethod })}>
            Encaisser
          </Button>
        </div>
      </section>
    </div>
  );
}
