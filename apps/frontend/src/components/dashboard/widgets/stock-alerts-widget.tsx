import { AlertTriangle } from "lucide-react";
import type { DashboardOverview } from "@dshow/shared";
import { SummaryWidget } from "../summary-widget";

export function StockAlertsWidget({ alerts }: { alerts: DashboardOverview["stockAlerts"] }) {
  return (
    <SummaryWidget title="Stock faible" subtitle="Produits necessitant un reapprovisionnement">
      <div className="grid gap-3">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-3xl border border-rose-100 bg-rose-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-100 p-2 text-rose-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{alert.productName}</p>
                <p className="mt-1 text-sm text-slate-500">{alert.activityName}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-rose-700">
                  Stock {alert.stock} / minimum {alert.minimum}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SummaryWidget>
  );
}

