"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { darkFormInputClass, darkFormPanelClass, darkFormSelectClass } from "@/components/ui/form-styles";

export function TicketingPanel({
  tickets,
  events,
  companyId,
  activityId,
  onCreateTicket,
}: {
  tickets: any[];
  events: any[];
  companyId?: string | null;
  activityId?: string | null;
  onCreateTicket: (payload: any) => Promise<void>;
}) {
  const [eventId, setEventId] = useState("");
  const [typeTicket, setTypeTicket] = useState("STANDARD");
  const [montant, setMontant] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className={darkFormPanelClass}>
        <h2 className="font-display text-3xl">Billetterie</h2>
        <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={`mt-4 ${darkFormSelectClass}`}>
          <option value="">Sans evenement</option>
          {events.map((event) => (
            <option key={event.id} value={event.id} className="text-slate-950">{event.nom}</option>
          ))}
        </select>
        <select value={typeTicket} onChange={(e) => setTypeTicket(e.target.value)} className={`mt-3 ${darkFormSelectClass}`}>
          <option value="STANDARD">Standard</option>
          <option value="VIP">VIP</option>
        </select>
        <input value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="Prix d'entree" className={`mt-3 ${darkFormInputClass}`} />
        <Button
          className="mt-4 w-full bg-fuchsia-600 hover:bg-fuchsia-500"
          disabled={!companyId || !activityId || !montant}
          onClick={() => onCreateTicket({ companyId, activityId, eventId: eventId || undefined, typeTicket, montant: Number(montant) })}
        >
          Creer un ticket
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#020617,#111827,#312e81)] p-5 text-white shadow-xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{ticket.typeTicket}</span>
              <span className={`rounded-full px-3 py-1 text-xs ${ticket.statut === "VALIDE" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-200"}`}>{ticket.statut}</span>
            </div>
            <p className="mt-5 text-sm text-slate-300">{ticket.reference}</p>
            <p className="mt-2 font-display text-2xl">{Number(ticket.montant).toLocaleString("fr-FR")} FCFA</p>
            <p className="mt-4 rounded-2xl bg-black/20 px-3 py-2 font-mono text-xs text-fuchsia-200">{ticket.qrCode}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
