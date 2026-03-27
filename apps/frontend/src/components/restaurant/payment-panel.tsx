"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formInputClass, formSelectClass } from "@/components/ui/form-styles";
import { cashierPanelClass } from "@/components/ui/table-styles";

const methods = ["CASH", "CARTE", "MOBILE_MONEY"];

export function PaymentPanel({
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
    <section className={cashierPanelClass}>
      <div>
        <h3 className="font-display text-3xl text-ink">Encaissement</h3>
        <p className="mt-1 text-sm text-slate-500">Paiement complet ou partiel de la commande.</p>
      </div>
      <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} className={formSelectClass}>
        <option value="">Choisir une commande</option>
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.reference} - {order.table?.nom ?? order.table?.code}
          </option>
        ))}
      </select>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" className={formInputClass} />
      <select value={method} onChange={(e) => setMethod(e.target.value)} className={formSelectClass}>
        {methods.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
      <Button
        disabled={!selectedOrderId || !amount || !companyId || !activityId}
        onClick={() =>
          onPay({
            companyId,
            activityId,
            restaurantOrderId: selectedOrderId,
            processedByUserId: userId,
            montant: Number(amount),
            modePaiement: method,
          })
        }
      >
        Valider le paiement
      </Button>
    </section>
  );
}
