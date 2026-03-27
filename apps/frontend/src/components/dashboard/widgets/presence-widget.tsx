import type { DashboardOverview } from "@dshow/shared";
import { SummaryWidget } from "../summary-widget";

export function PresenceWidget({ items }: { items: DashboardOverview["employeePresence"] }) {
  return (
    <SummaryWidget title="Presence employes" subtitle="Pointage et disponibilite du personnel">
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.userId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{item.userName}</p>
                <p className="mt-1 text-sm text-slate-500">{item.activityName}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-400">
              Derniere action {item.lastActionAt ? new Date(item.lastActionAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "N/A"}
            </p>
          </article>
        ))}
      </div>
    </SummaryWidget>
  );
}
