import type { DashboardOverview } from "@dshow/shared";
import { SummaryWidget } from "../summary-widget";

export function QuickStatsWidget({ stats }: { stats: DashboardOverview["quickStats"] }) {
  return (
    <SummaryWidget title="Statistiques rapides" subtitle="Vue synthese des indicateurs clefs">
      <div className="grid gap-3 md:grid-cols-2">
        {stats.map((item) => (
          <article key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 font-display text-3xl text-ink">{item.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{item.helper}</p>
          </article>
        ))}
      </div>
    </SummaryWidget>
  );
}

