"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formInputClass, formPanelClass } from "@/components/ui/form-styles";
import { useRealtime } from "@/providers/realtime-provider";
import { companyService } from "@/services/company-service";

export function CreateCompanyForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const { pushToast } = useRealtime();
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState("");
  const [raisonSociale, setRaisonSociale] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await companyService.create({ nom, raisonSociale });
      pushToast({
        title: "Entreprise creee",
        description: `${nom} est maintenant disponible pour la suite du parametrage.`,
        tone: "success",
      });
      setNom("");
      setRaisonSociale("");
      await onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={formPanelClass} onSubmit={handleSubmit}>
      <div>
        <h3 className="font-display text-2xl text-ink">Nouvelle entreprise</h3>
        <p className="mt-1 text-sm text-slate-500">Commencez toujours par creer l'entreprise avant ses activites.</p>
      </div>
      <input
        value={nom}
        onChange={(event) => setNom(event.target.value)}
        placeholder="Nom commercial"
        className={formInputClass}
      />
      <input
        value={raisonSociale}
        onChange={(event) => setRaisonSociale(event.target.value)}
        placeholder="Raison sociale"
        className={formInputClass}
      />
      <Button disabled={loading || !nom.trim()} className="bg-ink hover:bg-slate-800">
        {loading ? "Creation..." : "Creer l'entreprise"}
      </Button>
    </form>
  );
}
