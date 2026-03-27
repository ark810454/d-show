import { ArrowRight, Building2, Phone } from "lucide-react";
import type { CompanySummary } from "@dshow/shared";

export function CompanyCard({
  company,
  onSelect,
}: {
  company: CompanySummary;
  onSelect: (company: CompanySummary) => void;
}) {
  return (
    <button
      onClick={() => onSelect(company)}
      className="surface group w-full p-6 text-left transition hover:-translate-y-1 hover:border-gold/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-ink p-3 text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {company.statut}
        </span>
      </div>
      <h3 className="mt-5 font-display text-2xl text-ink">{company.nom}</h3>
      <p className="mt-2 text-sm text-slate-500">{company.raisonSociale ?? "Complexe commercial multi-activites"}</p>
      <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
        <Phone className="h-4 w-4" />
        {company.telephone ?? "Telephone non renseigne"}
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-pine">
        Ouvrir cette entreprise
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </button>
  );
}

