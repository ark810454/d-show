"use client";

import { formInputClass, formSelectClass } from "@/components/ui/form-styles";

export function FinanceFilters({
  value,
  activities,
  onChange,
}: {
  value: { from: string; to: string; granularity: string; activityId: string | undefined };
  activities: Array<{ id: string; nom: string; type?: string }>;
  onChange: (next: { from: string; to: string; granularity: string; activityId: string | undefined }) => void;
}) {
  return (
    <section className="surface p-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className={formInputClass}
        />
        <input
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className={formInputClass}
        />
        <select
          value={value.activityId ?? ""}
          onChange={(e) => onChange({ ...value, activityId: e.target.value || undefined })}
          className={formSelectClass}
        >
          <option value="">Toutes les activites</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.nom}
            </option>
          ))}
        </select>
        <select
          value={value.granularity}
          onChange={(e) => onChange({ ...value, granularity: e.target.value })}
          className={formSelectClass}
        >
          <option value="daily">Journalier</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuel</option>
        </select>
      </div>
    </section>
  );
}
