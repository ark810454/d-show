"use client";

import { Bell, BriefcaseBusiness, ChevronDown, RefreshCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { getActivityHomePath } from "@/lib/activity-routing";
import { canAccessUsersPage, getScopedRoleLabels, hasGlobalAdminAccess } from "@/lib/permissions";
import { clearAllSessionCookies } from "@/lib/session";
import { useRealtime } from "@/providers/realtime-provider";
import { activityService } from "@/services/activity-service";
import { authService } from "@/services/auth-service";
import { useAppStore } from "@/store/app-store";

export function Topbar() {
  const router = useRouter();
  const { activeContext, user, activities, companies, setActivities, setActiveContext, clearSession } = useAppStore();
  const { unreadCount, markAllAsRead } = useRealtime();
  const canSeeUsers = canAccessUsersPage(user, activeContext.activityId);
  const currentCompany = companies.find((item) => item.id === activeContext.companyId);
  const currentRoles = useMemo(() => {
    const scopedRoles = getScopedRoleLabels(user, activeContext.activityId);
    if (scopedRoles.length) {
      return scopedRoles;
    }
    if (hasGlobalAdminAccess(user)) {
      return ["admin_entreprise"];
    }
    return [];
  }, [activeContext.activityId, user]);

  useEffect(() => {
    if (!activeContext.companyId) {
      return;
    }

    activityService
      .listByCompany(activeContext.companyId)
      .then((data) => setActivities(data))
      .catch(() => undefined);
  }, [activeContext.companyId, setActivities]);

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // No-op if the backend session is already expired.
    }
    clearSession();
    clearAllSessionCookies();
    router.push("/login");
  }

  return (
    <header className="surface flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Session active</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Tableau de bord administrateur</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            {currentCompany?.nom ?? activeContext.companyName ?? "Entreprise non selectionnee"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-pine">
            <ShieldCheck className="h-3.5 w-3.5" />
            {currentRoles.length ? currentRoles.join(" / ") : "Aucun role actif"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Entreprise active</p>
          <p className="mt-1 font-semibold text-slate-800">
            {currentCompany?.nom ?? activeContext.companyName ?? "Non definie"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{currentCompany?.email ?? user?.email ?? "Aucun email"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Activite active</p>
          <div className="mt-1 flex items-center gap-3">
            <select
              value={activeContext.activityId ?? ""}
              onChange={(event) => {
                const next = activities.find((item) => item.id === event.target.value);
                if (!next) {
                  return;
                }
                setActiveContext({
                  activityId: next.id,
                  activityType: next.type,
                  activityName: next.nom,
                });
                router.push(getActivityHomePath(next.type));
              }}
              className="bg-transparent font-semibold text-slate-800 outline-none"
            >
              <option value="">{activeContext.activityName ?? "Choisir une activite"}</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.nom}
                </option>
              ))}
            </select>
            <button
              onClick={() => router.push("/select-activity")}
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-pine"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Changer
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">{activeContext.activityType ?? "Type non defini"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/profile" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Profil
          </Link>
          {canSeeUsers ? (
            <Link href="/users" className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Utilisateurs
            </Link>
          ) : null}
          <button onClick={handleLogout} className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700">
            Deconnexion
          </button>
        </div>
        <button onClick={markAllAsRead} className="relative flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white">
          <Bell className="h-4 w-4" />
          {unreadCount ? (
            <span className="absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
          {user ? `${user.prenom} ${user.nom}` : "Utilisateur"}
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
