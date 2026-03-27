"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccessMatrix } from "@/components/configuration/access-matrix";
import { EmptyState, InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { canAccessConfiguration } from "@/lib/permissions";
import { activityService } from "@/services/activity-service";
import { roleService, type RoleItem } from "@/services/role-service";
import { userService, type UserItem } from "@/services/user-service";
import { useAppStore } from "@/store/app-store";

type ActivityItem = {
  id: string;
  nom: string;
  type: string;
};

export default function AccessConfigurationPage() {
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const currentUser = useAppStore((state) => state.user);
  const storeActivities = useAppStore((state) => state.activities);
  const setActivities = useAppStore((state) => state.setActivities);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [activities, setLocalActivities] = useState<ActivityItem[]>([]);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!activeContext.companyId) {
      router.replace("/select-company");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [userData, roleData, activityData] = await Promise.all([
        userService.list(activeContext.companyId),
        roleService.list(),
        storeActivities.length ? Promise.resolve(storeActivities) : activityService.listByCompany(activeContext.companyId),
      ]);

      setUsers(userData);
      setRoles(roleData);
      setLocalActivities(activityData);
      if (!storeActivities.length) {
        setActivities(activityData);
      }
    } catch {
      setError("Impossible de charger la matrice d'acces.");
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

    if (!canAccessConfiguration(currentUser, activeContext.activityId)) {
      router.replace(activeContext.activityId ? "/select-activity" : "/dashboard");
      return;
    }

    void load();
  }, [hasHydrated, accessToken, activeContext.activityId, activeContext.companyId, currentUser, router]);

  if (!hasHydrated || !accessToken || !activeContext.companyId || !canAccessConfiguration(currentUser, activeContext.activityId)) {
    return (
      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto grid max-w-7xl gap-6">
          <SectionSkeleton cards={2} lines={3} />
        </div>
      </main>
    );
  }

  async function handleSave(userId: string, assignments: Array<{ activityId: string; roleId: string }>) {
    if (!activeContext.companyId) {
      return;
    }

    setSavingUserId(userId);
    try {
      await userService.assignRoles(userId, activeContext.companyId, assignments);
      await load();
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Configuration</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Matrice d'acces</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-500">
            Le responsable parametre ici les roles et activites de chaque utilisateur. Les permissions visibles
            dans l'application suivent directement ces affectations.
          </p>
        </section>

        {loading ? <SectionSkeleton cards={2} lines={3} /> : null}
        {!loading && error ? <InlineFeedback tone="error">{error}</InlineFeedback> : null}

        {!loading && !error && users.length === 0 ? (
          <EmptyState
            title="Aucun utilisateur a configurer"
            description="Commencez par creer des utilisateurs dans l'entreprise active, puis revenez ici pour leur attribuer leurs acces."
          />
        ) : null}

        {!loading && !error && users.length > 0 ? (
          <AccessMatrix
            users={users}
            roles={roles}
            activities={activities}
            currentUser={currentUser}
            savingUserId={savingUserId}
            onSave={handleSave}
          />
        ) : null}
      </div>
    </main>
  );
}
