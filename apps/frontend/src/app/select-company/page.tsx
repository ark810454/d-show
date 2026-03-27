"use client";

import type { CompanySummary } from "@dshow/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EmptyState, InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { CompanyCard } from "@/components/selection/company-card";
import { syncSessionCookies } from "@/lib/session";
import { CreateCompanyForm } from "@/components/selection/create-company-form";
import { companyService } from "@/services/company-service";
import { useAppStore } from "@/store/app-store";

export default function SelectCompanyPage() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const setCompanies = useAppStore((state) => state.setCompanies);
  const setActiveContext = useAppStore((state) => state.setActiveContext);
  const companies = useAppStore((state) => state.companies);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(company: CompanySummary) {
    setActiveContext({
      companyId: company.id,
      companyName: company.nom,
      activityId: null,
      activityType: null,
      activityName: null,
    });
    syncSessionCookies({
      companyId: company.id,
      activityId: null,
    });
    router.push("/select-activity");
  }

  async function loadCompanies() {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await companyService.getAuthorized();
      setCompanies(data);
      if (data.length === 1) {
        handleSelect(data[0]);
      }
    } catch {
      setError("Impossible de charger les entreprises autorisees. Reconnectez-vous si le probleme persiste.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!accessToken) {
      router.replace("/login");
      return;
    }

    void loadCompanies();
  }, [accessToken, hasHydrated, router]);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Etape 1</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Selectionner une entreprise</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-500">
            Apres connexion, l'utilisateur choisit d'abord l'entreprise autorisee avant de passer aux activites.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? <SectionSkeleton cards={3} lines={2} /> : null}
            {!loading && error ? <InlineFeedback tone="error">{error}</InlineFeedback> : null}
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} onSelect={handleSelect} />
            ))}
            {!loading && companies.length === 0 ? (
              <EmptyState
                title="Aucune entreprise autorisee"
                description="Ce compte n'a encore aucune entreprise disponible. Creez-en une ou demandez une affectation."
              />
            ) : null}
          </div>
        </section>
        <aside>
          <CreateCompanyForm onCreated={loadCompanies} />
        </aside>
      </div>
    </main>
  );
}
