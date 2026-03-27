"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function NightclubStatsPanel({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white"><p className="text-sm text-slate-400">Entrees</p><p className="mt-2 font-display text-3xl">{stats.totalEntries ?? 0}</p></article>
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white"><p className="text-sm text-slate-400">Billetterie</p><p className="mt-2 font-display text-3xl">{Number(stats.ticketRevenue ?? 0).toLocaleString("fr-FR")} FCFA</p></article>
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white"><p className="text-sm text-slate-400">Reservations</p><p className="mt-2 font-display text-3xl">{stats.reservations ?? 0}</p></article>
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white"><p className="text-sm text-slate-400">Ventes bouteilles</p><p className="mt-2 font-display text-3xl">{Number(stats.bottleRevenue ?? 0).toLocaleString("fr-FR")} FCFA</p></article>
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white"><p className="text-sm text-slate-400">Entrees VIP</p><p className="mt-2 font-display text-3xl">{stats.vipEntries ?? 0}</p></article>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white">
          <h3 className="font-display text-2xl">Frequentation par evenement</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.entriesByEvent ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#d946ef" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-5 text-white">
          <h3 className="font-display text-2xl">Top bouteilles</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topBottleSales ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="qty" fill="#22c55e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}
