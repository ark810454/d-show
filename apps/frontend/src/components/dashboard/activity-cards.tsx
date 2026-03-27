import { activitySummary } from "@/services/dashboard-service";
import { StatusBadge } from "@/components/ui/badge";

export function ActivityCards() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {activitySummary.map((activity) => (
        <article key={activity.id} className="surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{activity.type}</p>
              <h3 className="mt-2 font-display text-2xl text-ink">{activity.name}</h3>
            </div>
            <StatusBadge status={activity.status} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Equipe</p>
              <p className="mt-1 font-semibold text-slate-700">{activity.team}</p>
            </div>
            <div>
              <p className="text-slate-500">Recette</p>
              <p className="mt-1 font-semibold text-slate-700">{activity.revenue}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

