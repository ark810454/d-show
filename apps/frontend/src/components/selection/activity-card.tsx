import { ArrowRight } from "lucide-react";
import type { ActivitySummary } from "@dshow/shared";
import { ActivityIcon } from "./activity-icon";

export function ActivityCard({
  activity,
  onSelect,
}: {
  activity: ActivitySummary;
  onSelect: (activity: ActivitySummary) => void;
}) {
  return (
    <button
      onClick={() => onSelect(activity)}
      className="surface group w-full p-6 text-left transition hover:-translate-y-1 hover:border-pine/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-pine p-3 text-white">
          <ActivityIcon type={activity.type} className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {activity.statut}
        </span>
      </div>
      <h3 className="mt-5 font-display text-2xl text-ink">{activity.nom}</h3>
      <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-400">{activity.type}</p>
      <p className="mt-3 text-sm text-slate-500">{activity.description ?? "Module operationnel pret pour l'encodage."}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-gold">
        Acceder au dashboard
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}

