"use client";

import type { ActivitySummary } from "@dshow/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getActivityHomePath } from "@/lib/activity-routing";
import { hasGlobalAdminAccess, isSuperAdmin } from "@/lib/permissions";
import { clearAllSessionCookies, syncSessionCookies } from "@/lib/session";
import { EmptyState, InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { ActivityCard } from "@/components/selection/activity-card";
import { CreateActivityForm } from "@/components/selection/create-activity-form";
import { CreatePrimaryUserForm } from "@/components/selection/create-primary-user-form";
import { activityService } from "@/services/activity-service";
import { authService } from "@/services/auth-service";
import { useAppStore } from "@/store/app-store";

export default function SelectActivityPage() {
  const router = useRouter();
  const accessToken = useAppStore((state) => state.accessToken);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const user = useAppStore((state) => state.user);
  const activeContext = useAppStore((state) => state.activeContext);
  const activities = useAppStore((state) => state.activities);
  const setActivities = useAppStore((state) => state.setActivities);
  const setActiveContext = useAppStore((state) => state.setActiveContext);
  const clearSession = useAppStore((state) => state.clearSession);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canManageCompanySetup = hasGlobalAdminAccess(user);
  const canCreatePrimaryUser = isSuperAdmin(user);

  async function loadActivities() {
    if (!activeContext.companyId) {
      router.push("/select-company");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await activityService.listByCompany(activeContext.companyId);
      setActivities(data);
      if (data.length === 1) {
        handleSelect(data[0]);
      }
    } catch {
      setError("Impossible de charger les activites de cette entreprise.");
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

    void loadActivities();
  }, [accessToken, activeContext.companyId, hasHydrated]);

  function handleSelect(activity: ActivitySummary) {
    setActiveContext({
      activityId: activity.id,
      activityType: activity.type,
      activityName: activity.nom,
    });
    syncSessionCookies({
      companyId: activeContext.companyId,
      activityId: activity.id,
    });
    router.push(getActivityHomePath(activity.type));
  }

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // Ignore expired sessions.
    }

    clearSession();
    clearAllSessionCookies();
    router.push("/login");
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Etape 2</p>
          <h1 className="mt-3 font-display text-5xl text-ink">Choisir une activite</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-500">
            Entreprise active: <span className="font-semibold text-slate-700">{activeContext.companyName}</span>
          </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push("/select-company")}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Changer d'entreprise
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Deconnexion
              </button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? <SectionSkeleton cards={3} lines={2} /> : null}
            {!loading && error ? <InlineFeedback tone="error">{error}</InlineFeedback> : null}
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} onSelect={handleSelect} />
            ))}
            {!loading && activities.length === 0 ? (
              <EmptyState
                title="Aucune activite disponible"
                description="Aucune activite active ne vous est attribuee pour cette entreprise. Demandez a votre responsable de vous affecter un role sur au moins une activite."
              />
            ) : null}
          </div>
        </section>
        <aside>
          <div className="grid gap-6">
            {canManageCompanySetup && activeContext.companyId ? (
              <CreateActivityForm companyId={activeContext.companyId} onCreated={loadActivities} />
            ) : null}
            {canCreatePrimaryUser && activeContext.companyId ? (
              <CreatePrimaryUserForm
                companyId={activeContext.companyId}
                companyName={activeContext.companyName}
                activities={activities}
              />
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
