import type { DashboardOverview } from "@dshow/shared";
import { SummaryWidget } from "../summary-widget";

export function RecentActivityWidget({ items }: { items: DashboardOverview["recentActivities"] }) {
  return (
    <SummaryWidget title="Activite recente" subtitle="Dernieres actions utilisateurs sur la plateforme">
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{item.userName}</p>
                <p className="mt-1 text-sm text-slate-500">{item.description ?? item.action}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{item.module}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-slate-400">
              <span>{item.activityName ?? "Global"}</span>
              <span>{new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </article>
        ))}
      </div>
    </SummaryWidget>
  );
}

