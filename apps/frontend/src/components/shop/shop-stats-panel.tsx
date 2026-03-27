"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ShopStatsPanel({ stats }: { stats: any }) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-4 md:grid-cols-4">
        <article className="surface p-5"><p className="text-sm text-slate-500">CA boutique</p><p className="mt-2 font-display text-3xl text-ink">{Number(stats.revenue ?? 0).toLocaleString("fr-FR")} FCFA</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Ventes</p><p className="mt-2 font-display text-3xl text-ink">{stats.salesCount ?? 0}</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Marge estimee</p><p className="mt-2 font-display text-3xl text-ink">{Number(stats.estimatedMargin ?? 0).toLocaleString("fr-FR")} FCFA</p></article>
        <article className="surface p-5"><p className="text-sm text-slate-500">Top produits</p><p className="mt-2 font-display text-3xl text-ink">{stats.bestProducts?.length ?? 0}</p></article>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface p-5">
          <h3 className="font-display text-2xl text-ink">Ventes journalieres</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailySales ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="amount" fill="#0E5F59" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="surface p-5">
          <h3 className="font-display text-2xl text-ink">Meilleurs produits</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bestProducts ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="qty" fill="#C28A2D" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}
