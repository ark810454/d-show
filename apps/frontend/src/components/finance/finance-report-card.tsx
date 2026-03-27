"use client";

import { Button } from "@/components/ui/button";

export function FinanceReportCard({ report }: { report: any }) {
  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-ink">Rapport prepare</h3>
          <p className="text-sm text-slate-500">Vue imprimable ou exportable en PDF navigateur.</p>
        </div>
        <Button className="bg-gold text-white hover:bg-amber-600" onClick={() => window.print()}>
          Imprimer / PDF
        </Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">CA</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {Number(report?.summary?.revenue ?? 0).toLocaleString("fr-FR")} FCFA
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Depenses</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {Number(report?.summary?.expenses ?? 0).toLocaleString("fr-FR")} FCFA
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Benefice</p>
          <p className="mt-2 font-display text-2xl text-ink">
            {Number(report?.summary?.profit ?? 0).toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Activite la plus rentable</p>
          <p className="mt-2 text-base font-semibold text-ink">
            {report?.indicators?.mostProfitableActivity?.activityName ?? "Aucune activite dominante"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Employe le plus performant</p>
          <p className="mt-2 text-base font-semibold text-ink">
            {report?.indicators?.topEmployee?.userName ?? "Aucun resultat sur la periode"}
          </p>
        </div>
      </div>
    </section>
  );
}
