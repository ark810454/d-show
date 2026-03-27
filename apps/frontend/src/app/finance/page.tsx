"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FinanceCharts } from "@/components/finance/finance-charts";
import { FinanceDashboard } from "@/components/finance/finance-dashboard";
import { FinanceFilters } from "@/components/finance/finance-filters";
import { FinanceReportCard } from "@/components/finance/finance-report-card";
import { ExpenseForm } from "@/components/finance/expense-form";
import { ExpensesTable } from "@/components/finance/expenses-table";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { canAccessFinance } from "@/lib/permissions";
import { useRealtime } from "@/providers/realtime-provider";
import { financeService } from "@/services/finance-service";
import { useAppStore } from "@/store/app-store";

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

type FinanceFilterState = {
  from: string;
  to: string;
  granularity: string;
  activityId: string | undefined;
};

export default function FinancePage() {
  const router = useRouter();
  const pushToast = useRealtime().pushToast;
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const activities = useAppStore((state) => state.activities);
  const user = useAppStore((state) => state.user);
  const [filters, setFilters] = useState<FinanceFilterState>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    to: todayValue(),
    granularity: "daily",
    activityId: undefined as string | undefined,
  });
  const [dashboard, setDashboard] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(nextFilters = filters) {
    if (!activeContext.companyId) {
      return;
    }

    setLoading(true);
    setError(null);
    const params = {
      ...nextFilters,
      activityId: nextFilters.activityId,
    };

    try {
      const [dashboardData, reportData, categoryData, expenseData] = await Promise.all([
        financeService.dashboard(params),
        financeService.report(params),
        financeService.expenseCategories(),
        financeService.expenses(params),
      ]);
      setDashboard(dashboardData);
      setReport(reportData);
      setCategories(categoryData);
      setExpenses(expenseData);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message ?? "Le pilotage financier est temporairement indisponible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (!activeContext.companyId) {
      router.replace("/select-company");
      return;
    }
    if (!canAccessFinance(user, activeContext.activityId)) {
      router.replace(activeContext.activityId ? "/select-activity" : "/dashboard");
      return;
    }

    const initialFilters: FinanceFilterState = {
      ...filters,
      activityId: filters.activityId ?? activeContext.activityId ?? undefined,
    };
    setFilters(initialFilters);
    void load(initialFilters);
  }, [hasHydrated, accessToken, activeContext.companyId, activeContext.activityId, router, user]);

  if (!hasHydrated || !accessToken || !activeContext.companyId || !canAccessFinance(user, activeContext.activityId)) {
    return (
      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto grid max-w-7xl gap-6">
          <SectionSkeleton lines={2} />
          <SectionSkeleton lines={2} />
          <SectionSkeleton cards={4} />
          <SectionSkeleton cards={2} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Finance</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Pilotage financier global</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-500">
            Analysez les revenus, les depenses, la rentabilite et la performance de l'entreprise ou d'une activite ciblee.
          </p>
        </section>
        {error ? (
          <InlineFeedback tone="error">
            <p className="font-semibold">Finance indisponible</p>
            <p className="mt-1">{error}</p>
          </InlineFeedback>
        ) : null}
        <FinanceFilters
          value={filters}
          activities={activities}
          onChange={(next) => {
            setFilters(next);
            void load(next);
          }}
        />
        {loading ? (
          <>
            <SectionSkeleton cards={4} />
            <SectionSkeleton cards={2} />
          </>
        ) : (
          <>
            <FinanceDashboard data={dashboard} />
            <FinanceCharts timeline={dashboard?.timeline ?? []} byActivity={dashboard?.byActivity ?? []} />
          </>
        )}
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ExpenseForm
            companyId={activeContext.companyId}
            activityId={filters.activityId ?? activeContext.activityId}
            userId={user?.id}
            categories={categories}
            error={error}
            onSubmit={async (payload) => {
              await financeService.createExpense(payload);
              pushToast({
                title: "Depense enregistree",
                description: "Le tableau de bord financier a ete mis a jour.",
                tone: "success",
              });
              await load();
            }}
          />
          <FinanceReportCard report={report} />
        </div>
        <ExpensesTable items={expenses} />
      </div>
    </main>
  );
}
