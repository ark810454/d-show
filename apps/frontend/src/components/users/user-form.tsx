"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formInputClass, formPanelClass, formSelectClass } from "@/components/ui/form-styles";
import { SUPERUSER_ONLY_ROLE_NAMES, hasGlobalAdminAccess, isSuperAdmin } from "@/lib/permissions";
import { useRealtime } from "@/providers/realtime-provider";
import { roleService, type RoleItem } from "@/services/role-service";
import { userService, type CreateUserPayload, type UserItem } from "@/services/user-service";
import { useAppStore } from "@/store/app-store";

export function UserForm({
  editingUser,
  onCancelEdit,
  onSaved,
}: {
  editingUser?: UserItem | null;
  onCancelEdit: () => void;
  onSaved: () => Promise<void>;
}) {
  const { pushToast } = useRealtime();
  const companyId = useAppStore((state) => state.activeContext.companyId);
  const activities = useAppStore((state) => state.activities);
  const currentUser = useAppStore((state) => state.user);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [assignments, setAssignments] = useState<Array<{ activityId: string; roleId: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mustAssignActivity = !editingUser && !hasGlobalAdminAccess(currentUser);
  const canAssignProtectedRoles = isSuperAdmin(currentUser);
  const isProtectedRole = (roleName?: string) =>
    SUPERUSER_ONLY_ROLE_NAMES.includes((roleName ?? "") as (typeof SUPERUSER_ONLY_ROLE_NAMES)[number]);
  const availableRoles = roles.filter(
    (role) => canAssignProtectedRoles || !isProtectedRole(role.nom),
  );

  useEffect(() => {
    roleService.list().then(setRoles).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!editingUser) {
      setNom("");
      setPrenom("");
      setEmail("");
      setTelephone("");
      setMotDePasse("");
      setAssignments([]);
      setError(null);
      return;
    }

    setNom(editingUser.nom);
    setPrenom(editingUser.prenom);
    setEmail(editingUser.email);
    setTelephone(editingUser.telephone ?? "");
    setAssignments(
      editingUser.assignments.map((assignment) => ({
        activityId: assignment.activityId,
        roleId: assignment.roleId,
      })),
    );
    setError(null);
  }, [editingUser]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyId) {
      return;
    }

    if (!editingUser && !assignments.length) {
      setError("Attribuez au moins un role sur une activite avant de creer cet utilisateur.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (editingUser) {
        await userService.update(editingUser.id, companyId, {
          nom,
          prenom,
          email,
          telephone,
          ...(motDePasse ? { motDePasse } : {}),
        });
        await userService.assignRoles(editingUser.id, companyId, assignments);
        pushToast({
          title: "Utilisateur mis a jour",
          description: `${prenom} ${nom} a ete mis a jour avec ses nouveaux acces.`,
          tone: "success",
        });
      } else {
        const payload: CreateUserPayload = {
          companyId,
          nom,
          prenom,
          email,
          telephone,
          motDePasse,
          assignments,
        };
        await userService.create(payload);
        pushToast({
          title: "Utilisateur cree",
          description: `${prenom} ${nom} a ete ajoute a l'entreprise active.`,
          tone: "success",
        });
      }
      await onSaved();
      setMotDePasse("");
      if (!editingUser) {
        setNom("");
        setPrenom("");
        setEmail("");
        setTelephone("");
        setAssignments([]);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const message = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(", ")
          : String(error.response.data.message);
        setError(message);
      } else {
        setError("Impossible d'enregistrer cet utilisateur.");
      }
    } finally {
      setLoading(false);
    }
  }

  function addAssignment() {
    if (!selectedActivityId || !selectedRoleId) {
      return;
    }

    const pickedRole = roles.find((role) => role.id === selectedRoleId);
    if (pickedRole && !canAssignProtectedRoles && isProtectedRole(pickedRole.nom)) {
      setError("Les roles admin_entreprise et super_admin sont reserves au super utilisateur admin@dshow.app.");
      return;
    }

    setAssignments((current) => {
      const exists = current.some(
        (assignment) =>
          assignment.activityId === selectedActivityId && assignment.roleId === selectedRoleId,
      );
      if (exists) {
        return current;
      }
      return [...current, { activityId: selectedActivityId, roleId: selectedRoleId }];
    });
    setSelectedActivityId("");
    setSelectedRoleId("");
  }

  function removeAssignment(activityId: string, roleId: string) {
    setAssignments((current) =>
      current.filter((assignment) => !(assignment.activityId === activityId && assignment.roleId === roleId)),
    );
  }

  return (
    <form className={formPanelClass} onSubmit={handleSubmit}>
      <div>
        <h3 className="font-display text-2xl text-ink">
          {editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">Creation, edition et affectation des roles par activite.</p>
      </div>
      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" className={formInputClass} />
        <input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Prenom" className={formInputClass} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={formInputClass} />
        <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Telephone" className={formInputClass} />
      </div>
      <input
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
        placeholder={editingUser ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
        type="password"
        className={formInputClass}
      />
      <div className="rounded-3xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700">Roles par activite</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select value={selectedActivityId} onChange={(e) => setSelectedActivityId(e.target.value)} className={formSelectClass}>
            <option value="">Choisir une activite</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.nom}
              </option>
            ))}
          </select>
          <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className={formSelectClass}>
            <option value="">Choisir un role</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nom}
              </option>
            ))}
          </select>
          <Button type="button" className="bg-white text-slate-700 hover:bg-slate-100" onClick={addAssignment}>
            Ajouter
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {assignments.map((assignment) => {
            const activity = activities.find((item) => item.id === assignment.activityId);
            const role = roles.find((item) => item.id === assignment.roleId);
            return (
              <button
                key={`${assignment.activityId}-${assignment.roleId}`}
                type="button"
                onClick={() => removeAssignment(assignment.activityId, assignment.roleId)}
                className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                {activity?.nom ?? assignment.activityId} - {role?.nom ?? assignment.roleId} x
              </button>
            );
          })}
        </div>
        {mustAssignActivity && !assignments.length ? (
          <p className="mt-3 text-sm text-amber-700">
            Un utilisateur interne doit avoir au moins une affectation d'activite.
          </p>
        ) : null}
        {!canAssignProtectedRoles ? (
          <p className="mt-3 text-sm text-amber-700">
            Les roles <span className="font-semibold">admin_entreprise</span> et <span className="font-semibold">super_admin</span> sont reserves au super utilisateur <span className="font-semibold">admin@dshow.app</span>.
          </p>
        ) : null}
      </div>
      {editingUser ? (
        <Button type="button" className="bg-white text-slate-700 hover:bg-slate-100" onClick={onCancelEdit}>
          Annuler la modification
        </Button>
      ) : null}
      <Button
        disabled={
          loading ||
          !nom ||
          !prenom ||
          !email ||
          (!editingUser && !motDePasse) ||
          (mustAssignActivity && !assignments.length)
        }
      >
        {loading ? "Enregistrement..." : editingUser ? "Mettre a jour" : "Creer l'utilisateur"}
      </Button>
    </form>
  );
}
