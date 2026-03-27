"use client";

import { ActivityType } from "@dshow/shared";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formInputClass, formPanelClass, formSelectClass } from "@/components/ui/form-styles";
import { useRealtime } from "@/providers/realtime-provider";
import { activityService } from "@/services/activity-service";

const types = Object.values(ActivityType);

export function CreateActivityForm({
  companyId,
  onCreated,
}: {
  companyId: string;
  onCreated: () => Promise<void>;
}) {
  const { pushToast } = useRealtime();
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState("");
  const [type, setType] = useState<ActivityType>(ActivityType.RESTAURANT);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await activityService.create({
        companyId,
        nom,
        type,
      });
      pushToast({
        title: "Activite creee",
        description: `${nom} a ete ajoutee a l'entreprise active.`,
        tone: "success",
      });
      setNom("");
      setType(ActivityType.RESTAURANT);
      await onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={formPanelClass} onSubmit={handleSubmit}>
      <div>
        <h3 className="font-display text-2xl text-ink">Nouvelle activite</h3>
        <p className="mt-1 text-sm text-slate-500">Ajoutez les modules operationnels de l'entreprise selectionnee.</p>
      </div>
      <input
        value={nom}
        onChange={(event) => setNom(event.target.value)}
        placeholder="Nom de l'activite"
        className={formInputClass}
      />
      <select
        value={type}
        onChange={(event) => setType(event.target.value as ActivityType)}
        className={formSelectClass}
      >
        {types.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
      <Button disabled={loading || !nom.trim()} className="bg-pine hover:bg-teal-800">
        {loading ? "Creation..." : "Creer l'activite"}
      </Button>
    </form>
  );
}
