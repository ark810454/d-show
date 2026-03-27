"use client";

import { useMemo, useState } from "react";
import { ActivityRevenueChart } from "@/components/dashboard/charts/activity-revenue-chart";
import { RevenueChart } from "@/components/dashboard/charts/revenue-chart";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { QuickStatsWidget } from "@/components/dashboard/widgets/quick-stats-widget";
import { RecentActivityWidget } from "@/components/dashboard/widgets/recent-activity-widget";
import { ShortcutsWidget } from "@/components/dashboard/widgets/shortcuts-widget";
import { StockAlertsWidget } from "@/components/dashboard/widgets/stock-alerts-widget";
import { PresenceWidget } from "@/components/dashboard/widgets/presence-widget";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useDashboardOverview } from "@/hooks/use-dashboard-overview";
import { useAppStore } from "@/store/app-store";

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 6);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function DashboardShell() {
  const activeContext = useAppStore((state) => state.activeContext);
  const activities = useAppStore((state) => state.activities);
  const [filters, setFilters] = useState(() => ({
    ...defaultDateRange(),
    activityId: activeContext.activityId ?? "",
  }));

  const queryFilters = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      activityId: filters.activityId || undefined,
    }),
    [filters],
  );

  const { data, loading } = useDashboardOverview(queryFilters);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>
        <div className="grid gap-4">
          <Topbar />
          <section className="surface overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-ink px-6 py-8 text-white lg:px-8">
                <p className="text-sm uppercase tracking-[0.2em] text-white/55">Vue d'ensemble</p>
                <h2 className="mt-4 font-display text-4xl">
                  {activeContext.companyName ?? "Entreprise active"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm text-white/75">
                  Pilotage transversal des activites, encaissements, presence equipes et alertes critiques.
                </p>
              </div>
              <div className="bg-gradient-to-br from-white to-slate-50 px-6 py-8 lg:px-8">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Contexte courant</p>
                <p className="mt-4 font-display text-3xl text-ink">
                  {activeContext.activityName ?? "Toutes les activites"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Filtrez la periode et l'activite pour suivre la performance globale ou une vue module.
                </p>
              </div>
            </div>
          </section>

          <DashboardFilters activities={activities} filters={filters} onChange={setFilters} />

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {data.kpis.map((kpi) => (
                  <KpiCard key={kpi.label} kpi={kpi} />
                ))}
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                <RevenueChart data={data.revenueSeries} />
                <QuickStatsWidget stats={data.quickStats} />
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <ActivityRevenueChart data={data.revenueByActivity} />
                <ShortcutsWidget shortcuts={data.shortcuts} />
              </section>

              <section className="grid gap-4 lg:grid-cols-3">
                <StockAlertsWidget alerts={data.stockAlerts} />
                <PresenceWidget items={data.employeePresence} />
                <RecentActivityWidget items={data.recentActivities} />
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
