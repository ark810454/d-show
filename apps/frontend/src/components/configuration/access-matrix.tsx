"use client";

import axios from "axios";
import { useMemo, useState } from "react";
import { EmptyState, InlineFeedback } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { SUPERUSER_ONLY_ROLE_NAMES, isSuperAdmin, type SessionUserWithAssignments } from "@/lib/permissions";
import { useRealtime } from "@/providers/realtime-provider";
import type { RoleItem } from "@/services/role-service";
import type { UserItem } from "@/services/user-service";

type ActivityItem = {
  id: string;
  nom: string;
  type: string;
};

type AccessMatrixProps = {
  users: UserItem[];
  activities: ActivityItem[];
  roles: RoleItem[];
  currentUser?: SessionUserWithAssignments | null;
  savingUserId?: string | null;
  onSave: (userId: string, assignments: Array<{ activityId: string; roleId: string }>) => Promise<void>;
};

export function AccessMatrix({ users, activities, roles, currentUser, savingUserId, onSave }: AccessMatrixProps) {
  const { pushToast } = useRealtime();
  const [drafts, setDrafts] = useState<Record<string, Array<{ activityId: string; roleId: string }>>>({});
  const [selection, setSelection] = useState<Record<string, { activityId: string; roleId: string }>>({});
  const [feedback, setFeedback] = useState<Record<string, { type: "success" | "error"; message: string }>>({});
  const canAssignProtectedRoles = isSuperAdmin(currentUser);
  const isProtectedRole = (roleName?: string) =>
    SUPERUSER_ONLY_ROLE_NAMES.includes((roleName ?? "") as (typeof SUPERUSER_ONLY_ROLE_NAMES)[number]);

  const visibleRoles = useMemo(
    () =>
      roles.filter((role) => canAssignProtectedRoles || !isProtectedRole(role.nom)),
    [canAssignProtectedRoles, roles],
  );
  const roleMap = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const activityMap = useMemo(() => new Map(activities.map((activity) => [activity.id, activity])), [activities]);

  function getAssignments(user: UserItem) {
    return drafts[user.id] ?? user.assignments.map((assignment) => ({
      activityId: assignment.activityId,
      roleId: assignment.roleId,
    }));
  }

  function setAssignments(userId: string, assignments: Array<{ activityId: string; roleId: string }>) {
    setDrafts((current) => ({ ...current, [userId]: assignments }));
  }

  function addAssignment(user: UserItem) {
    const picked = selection[user.id];
    if (!picked?.activityId || !picked?.roleId) {
      setFeedback((current) => ({
        ...current,
        [user.id]: { type: "error", message: "Choisissez une activite et un role avant d'ajouter." },
      }));
      return;
    }

    const pickedRole = roleMap.get(picked.roleId);
    if (pickedRole && !canAssignProtectedRoles && isProtectedRole(pickedRole.nom)) {
      setFeedback((current) => ({
        ...current,
        [user.id]: {
          type: "error",
          message: "Les roles admin_entreprise et super_admin sont reserves au super utilisateur admin@dshow.app.",
        },
      }));
      return;
    }

    const nextAssignments = getAssignments(user);
    const exists = nextAssignments.some(
      (assignment) =>
        assignment.activityId === picked.activityId && assignment.roleId === picked.roleId,
    );

    if (exists) {
      setFeedback((current) => ({
        ...current,
        [user.id]: { type: "error", message: "Cette affectation existe deja pour cet utilisateur." },
      }));
      return;
    }

    setAssignments(user.id, [...nextAssignments, picked]);
    setSelection((current) => ({ ...current, [user.id]: { activityId: "", roleId: "" } }));
    setFeedback((current) => ({
      ...current,
      [user.id]: { type: "success", message: "Affectation ajoutee au brouillon. N'oubliez pas d'enregistrer." },
    }));
  }

  function removeAssignment(user: UserItem, activityId: string, roleId: string) {
    setAssignments(
      user.id,
      getAssignments(user).filter(
        (assignment) => !(assignment.activityId === activityId && assignment.roleId === roleId),
      ),
    );
  }

  async function saveUser(user: UserItem) {
    try {
      const assignments = getAssignments(user);
      await onSave(user.id, assignments);
      pushToast({
        title: "Acces enregistres",
        description: `Les roles et activites de ${user.prenom} ${user.nom} ont ete mis a jour.`,
        tone: "success",
      });
      setFeedback((current) => ({
        ...current,
        [user.id]: { type: "success", message: "Matrice d'acces enregistree avec succes." },
      }));
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? Array.isArray(error.response.data.message)
            ? error.response.data.message.join(", ")
            : String(error.response.data.message)
          : "Impossible d'enregistrer les acces pour cet utilisateur.";

      setFeedback((current) => ({
        ...current,
        [user.id]: { type: "error", message },
      }));
    }
  }

  return (
    <div className="grid gap-5">
      {users.map((user) => {
        const assignments = getAssignments(user);
        const state = selection[user.id] ?? { activityId: "", roleId: "" };
        const userFeedback = feedback[user.id];

        return (
          <section key={user.id} className="surface grid gap-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-ink">
                  {user.prenom} {user.nom}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {user.statut}
                </p>
              </div>
              <Button
                disabled={savingUserId === user.id}
                onClick={() => void saveUser(user)}
              >
                {savingUserId === user.id ? "Enregistrement..." : "Enregistrer les acces"}
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <select
                value={state.activityId}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    [user.id]: { ...state, activityId: event.target.value },
                  }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option value="">Choisir une activite</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.nom} - {activity.type}
                  </option>
                ))}
              </select>
              <select
                value={state.roleId}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    [user.id]: { ...state, roleId: event.target.value },
                  }))
                }
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              >
                <option value="">Choisir un role</option>
                {visibleRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nom}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                className="bg-white text-slate-700 hover:bg-slate-100"
                onClick={() => addAssignment(user)}
              >
                Ajouter
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {assignments.length === 0 ? (
                <EmptyState
                  title="Aucune affectation"
                  description="Ajoutez une activite et un role pour definir les acces de cet utilisateur."
                />
              ) : null}
              {assignments.map((assignment) => {
                const role = roleMap.get(assignment.roleId);
                const activity = activityMap.get(assignment.activityId);
                return (
                  <button
                    key={`${user.id}-${assignment.activityId}-${assignment.roleId}`}
                    type="button"
                    onClick={() => removeAssignment(user, assignment.activityId, assignment.roleId)}
                    className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    {activity?.nom ?? assignment.activityId} - {role?.nom ?? assignment.roleId} x
                  </button>
                );
              })}
            </div>

            {!canAssignProtectedRoles ? (
              <p className="text-xs font-medium text-amber-700">
                Les roles <span className="font-semibold">admin_entreprise</span> et <span className="font-semibold">super_admin</span> ne peuvent etre attribues que par le super utilisateur <span className="font-semibold">admin@dshow.app</span>.
              </p>
            ) : null}

            {userFeedback ? (
              <InlineFeedback tone={userFeedback.type === "success" ? "success" : "error"}>
                {userFeedback.message}
              </InlineFeedback>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
