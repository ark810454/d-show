"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TerraceStatsPanel({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="surface p-5"><p className="text-sm text-slate-500">Revenus terrasse</p><p className="mt-2 font-display text-3xl text-ink">{Number(stats.revenue ?? 0).toLocaleString("fr-FR")} FCFA</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Tickets</p><p className="mt-2 font-display text-3xl text-ink">{stats.totalOrders ?? 0}</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Impact happy hour</p><p className="mt-2 font-display text-3xl text-ink">{Number(stats.impactHappyHour ?? 0).toLocaleString("fr-FR")} FCFA</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Top boissons</p><p className="mt-2 font-display text-3xl text-ink">{stats.topDrinks?.length ?? 0}</p></article>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface p-5">
          <h3 className="font-display text-2xl text-ink">Boissons les plus vendues</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topDrinks ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="qty" fill="#C28A2D" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="surface p-5">
          <h3 className="font-display text-2xl text-ink">Volume par heure</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.volumeByHour ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="amount" fill="#0E5F59" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}

