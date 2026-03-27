"use client";

import type { ActivitySummary } from "@dshow/shared";

interface DashboardFiltersProps {
  activities: ActivitySummary[];
  filters: {
    from: string;
    to: string;
    activityId: string;
  };
  onChange: (next: { from: string; to: string; activityId: string }) => void;
}

export function DashboardFilters({ activities, filters, onChange }: DashboardFiltersProps) {
  return (
    <section className="surface flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Filtres</p>
        <h3 className="mt-2 font-display text-2xl text-ink">Pilotage global</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          type="date"
          value={filters.from}
          onChange={(event) => onChange({ ...filters, from: event.target.value })}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(event) => onChange({ ...filters, to: event.target.value })}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
        />
        <select
          value={filters.activityId}
          onChange={(event) => onChange({ ...filters, activityId: event.target.value })}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
        >
          <option value="">Toutes les activites</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.nom}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

