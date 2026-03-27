"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/feedback";
import { formInputClass, formPanelClass, formSelectClass } from "@/components/ui/form-styles";

export function ExpenseForm({
  companyId,
  activityId,
  userId,
  categories,
  error,
  onSubmit,
}: {
  companyId?: string | null;
  activityId?: string | null;
  userId?: string;
  categories: any[];
  error?: string | null;
  onSubmit: (payload: any) => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [justificatif, setJustificatif] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!companyId || !categoryId || !amount || !date || !description) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        companyId,
        activityId: activityId || undefined,
        financeAccountId: categoryId,
        userId,
        montant: Number(amount),
        dateTransaction: new Date(date).toISOString(),
        description,
        justificatif: justificatif || undefined,
      });
      setCategoryId("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setDescription("");
      setJustificatif("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={formPanelClass}>
      <h3 className="font-display text-2xl text-ink">Nouvelle depense</h3>
      {error ? (
        <InlineFeedback tone="error">
          <p className="font-semibold">Pilotage financier indisponible</p>
          <p className="mt-1">{error}</p>
        </InlineFeedback>
      ) : null}
      {!categories.length ? (
        <InlineFeedback tone="info">
          <p className="font-semibold">Categories standard en cours d'initialisation</p>
          <p className="mt-1">Les postes de depense par defaut seront crees automatiquement pour cette entreprise.</p>
        </InlineFeedback>
      ) : null}
      <div className="grid gap-3">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={formSelectClass}>
          <option value="">Categorie de depense</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.nom}</option>
          ))}
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant" className={formInputClass} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={formInputClass} />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className={formInputClass} />
        <input value={justificatif} onChange={(e) => setJustificatif(e.target.value)} placeholder="Lien justificatif (optionnel)" className={formInputClass} />
        <Button
          disabled={!companyId || !categoryId || !amount || !date || !description || submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? "Enregistrement..." : "Enregistrer la depense"}
        </Button>
      </div>
    </section>
  );
}
