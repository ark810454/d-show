"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RestaurantStatusPill } from "@/components/restaurant/status-pill";
import { formInputClass, formSelectClass } from "@/components/ui/form-styles";
import { cashierListCardClass, cashierPanelClass, tablePanelClass } from "@/components/ui/table-styles";

export function TerraceCashier({
  orders,
  companyId,
  activityId,
  userId,
  onPay,
}: {
  orders: any[];
  companyId?: string | null;
  activityId?: string | null;
  userId?: string;
  onPay: (payload: any) => Promise<void>;
}) {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className={tablePanelClass}>
        <h3 className="font-display text-3xl text-ink">Tickets terrasse</h3>
        <div className="mt-4 grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className={cashierListCardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{order.reference}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.table?.nom ?? order.table?.code ?? "Comptoir"}</p>
                </div>
                <RestaurantStatusPill value={order.statutPaiement} />
              </div>
              <p className="mt-3 font-display text-2xl text-ink">{Number(order.totalNet).toLocaleString("fr-FR")} FCFA</p>
            </article>
          ))}
        </div>
      </section>
      <section className={`${cashierPanelClass} h-fit`}>
        <h3 className="font-display text-3xl text-ink">Encaissement rapide</h3>
        <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} className={`mt-4 w-full ${formSelectClass}`}>
          <option value="">Choisir un ticket</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>{order.reference}</option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" className={`mt-3 w-full ${formInputClass}`} />
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={`mt-3 w-full ${formSelectClass}`}>
          <option value="CASH">CASH</option>
          <option value="CARTE">CARTE</option>
          <option value="MOBILE_MONEY">MOBILE_MONEY</option>
        </select>
        <Button className="mt-5 w-full" disabled={!selectedOrderId || !amount || !companyId || !activityId} onClick={() => onPay({ companyId, activityId, terraceOrderId: selectedOrderId, processedByUserId: userId, montant: Number(amount), modePaiement: method })}>
          Encaisser
        </Button>
      </section>
    </div>
  );
}
