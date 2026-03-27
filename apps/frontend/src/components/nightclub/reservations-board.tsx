"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { darkFormInputClass, darkFormPanelClass, darkFormSelectClass } from "@/components/ui/form-styles";

export function ReservationsBoard({
  bookings,
  zones,
  companyId,
  activityId,
  onCreate,
  onStatusChange,
}: {
  bookings: any[];
  zones: any[];
  companyId?: string | null;
  activityId?: string | null;
  onCreate: (payload: any) => Promise<void>;
  onStatusChange: (id: string, statut: string) => Promise<void>;
}) {
  const [zoneId, setZoneId] = useState("");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("4");
  const [amount, setAmount] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className={darkFormPanelClass}>
        <h2 className="font-display text-3xl">Reservation VIP</h2>
        <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={`mt-4 ${darkFormSelectClass}`}>
          <option value="">Choisir une table / zone</option>
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id} className="text-slate-950">{zone.nom}</option>
          ))}
        </select>
        <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" className={`mt-3 ${darkFormInputClass}`} />
        <input value={people} onChange={(e) => setPeople(e.target.value)} placeholder="Nombre de personnes" className={`mt-3 ${darkFormInputClass}`} />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant total" className={`mt-3 ${darkFormInputClass}`} />
        <Button className="mt-4 w-full bg-fuchsia-600 hover:bg-fuchsia-500" disabled={!companyId || !activityId || !date || !amount} onClick={() => onCreate({ companyId, activityId, zoneId: zoneId || undefined, typeReservation: zoneId ? "TABLE" : "EVENT", dateEvenement: new Date(date).toISOString(), nombrePersonnes: Number(people), totalTtc: Number(amount), acompte: Number(amount) * 0.3 })}>
          Creer la reservation
        </Button>
      </section>

      <section className="grid gap-4">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-[2rem] border border-white/10 bg-slate-900 p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">{booking.reference}</p>
                <h3 className="mt-1 font-display text-2xl">{booking.zone?.nom ?? "Reservation evenement"}</h3>
              </div>
              <select value={booking.statut} onChange={(e) => void onStatusChange(booking.id, e.target.value)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                <option value="CONFIRMEE" className="text-slate-950">CONFIRMEE</option>
                <option value="EN_COURS" className="text-slate-950">EN_COURS</option>
                <option value="TERMINEE" className="text-slate-950">TERMINEE</option>
                <option value="ANNULEE" className="text-slate-950">ANNULEE</option>
              </select>
            </div>
            <p className="mt-2 text-sm text-slate-300">{new Date(booking.dateEvenement).toLocaleString("fr-FR")} • {booking.nombrePersonnes} personnes</p>
            <p className="mt-3 text-lg font-semibold">{Number(booking.totalTtc).toLocaleString("fr-FR")} FCFA</p>
          </article>
        ))}
      </section>
    </div>
  );
}
