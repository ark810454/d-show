"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/ui/feedback";

export function FinanceCharts({ timeline, byActivity }: { timeline: any[]; byActivity: any[] }) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="surface p-5">
        <h3 className="font-display text-2xl text-ink">Evolution financiere</h3>
        {timeline.length ? (
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#0E5F59" fill="#0E5F5922" />
                <Area type="monotone" dataKey="expenses" stroke="#dc2626" fill="#dc262622" />
                <Area type="monotone" dataKey="profit" stroke="#16a34a" fill="#16a34a22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="Pas encore d'evolution disponible"
              description="Le graphique s'activera des qu'il y aura des ventes ou des depenses sur la periode."
            />
          </div>
        )}
      </article>
      <article className="surface p-5">
        <h3 className="font-display text-2xl text-ink">Rentabilite par activite</h3>
        {byActivity.length ? (
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="activityName" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="profit" fill="#C28A2D" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="Aucune comparaison par activite"
              description="Creer des ventes ou des depenses sur plusieurs activites pour comparer leur rentabilite."
            />
          </div>
        )}
      </article>
    </section>
  );
}
