"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RestaurantStatsPanel({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="surface p-5"><p className="text-sm text-slate-500">CA restaurant</p><p className="mt-2 font-display text-3xl text-ink">{Number(stats.revenue ?? 0).toLocaleString("fr-FR")} FCFA</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Commandes</p><p className="mt-2 font-display text-3xl text-ink">{stats.totalOrders ?? 0}</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Prep moyenne</p><p className="mt-2 font-display text-3xl text-ink">{stats.averagePreparationMinutes ?? 0} min</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Plats prets</p><p className="mt-2 font-display text-3xl text-ink">{stats.statuses?.ready ?? 0}</p></article>
      </section>
      <section className="surface p-5">
        <h3 className="font-display text-2xl text-ink">Plats les plus vendus</h3>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.topItems ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="qty" fill="#0E5F59" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
