"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { darkFormInputClass, darkFormPanelClass } from "@/components/ui/form-styles";

export function EventsBoard({
  events,
  companyId,
  activityId,
  onCreate,
}: {
  events: any[];
  companyId?: string | null;
  activityId?: string | null;
  onCreate: (payload: any) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [dj, setDj] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className={darkFormPanelClass}>
        <h2 className="font-display text-3xl">Nouvel evenement</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de soiree" className={`mt-4 ${darkFormInputClass}`} />
        <input value={dj} onChange={(e) => setDj(e.target.value)} placeholder="DJ invite" className={`mt-3 ${darkFormInputClass}`} />
        <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" className={`mt-3 ${darkFormInputClass}`} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Prix d'entree" className={`mt-3 ${darkFormInputClass}`} />
        <Button className="mt-4 w-full bg-fuchsia-600 hover:bg-fuchsia-500" disabled={!companyId || !activityId || !name || !date || !price} onClick={() => onCreate({ companyId, activityId, nom: name, djInvite: dj, dateEvenement: new Date(date).toISOString(), prixEntree: Number(price) })}>
          Creer la soiree
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#111827,#1e1b4b,#4c1d95)] p-5 text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-fuchsia-300">{event.statut}</p>
            <h3 className="mt-3 font-display text-3xl">{event.nom}</h3>
            <p className="mt-2 text-sm text-slate-300">{event.djInvite || "Line-up a confirmer"}</p>
            <p className="mt-4 text-sm text-slate-400">{new Date(event.dateEvenement).toLocaleString("fr-FR")}</p>
            <p className="mt-3 text-xl font-semibold">{Number(event.prixEntree).toLocaleString("fr-FR")} FCFA</p>
          </article>
        ))}
      </section>
    </div>
  );
}
