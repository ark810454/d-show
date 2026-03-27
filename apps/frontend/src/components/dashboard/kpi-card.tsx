import type { DashboardKpi } from "@dshow/shared";
import { cn } from "@/lib/cn";

const toneStyles: Record<DashboardKpi["tone"], string> = {
  success: "text-emerald-700 bg-emerald-50",
  warning: "text-amber-700 bg-amber-50",
  danger: "text-rose-700 bg-rose-50",
  neutral: "text-slate-700 bg-slate-100",
};

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  return (
    <article className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{kpi.label}</p>
          <p className="mt-3 font-display text-3xl text-ink">{kpi.value}</p>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", toneStyles[kpi.tone])}>
          {kpi.delta}
        </span>
      </div>
    </article>
  );
}

