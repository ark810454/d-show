"use client";

import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";

export function FinanceDashboard({ data }: { data: any }) {
  if (!data) {
    return (
      <section className="surface p-5">
        <EmptyState
          title="Aucune donnee financiere"
          description="Les indicateurs apparaitront ici des que des ventes ou depenses seront enregistrees."
        />
      </section>
    );
  }

  const cards = [
    { label: "CA global", value: data?.kpis?.revenue ?? 0, icon: Wallet, tone: "text-pine" },
    { label: "Depenses", value: data?.kpis?.expenses ?? 0, icon: TrendingDown, tone: "text-rose-600" },
    { label: "Benefice estime", value: data?.kpis?.profit ?? 0, icon: TrendingUp, tone: "text-emerald-600" },
    { label: "Panier moyen", value: data?.kpis?.basketAverage ?? 0, icon: Wallet, tone: "text-amber-600" },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article key={label} className="surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{label}</p>
            <Icon className={`h-5 w-5 ${tone}`} />
          </div>
          <p className="mt-4 font-display text-4xl text-ink">{Number(value).toLocaleString("fr-FR")} FCFA</p>
        </article>
      ))}
    </section>
  );
}
