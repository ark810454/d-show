"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { clearAllSessionCookies } from "@/lib/session";
import { authService } from "@/services/auth-service";
import { roleService, type RoleItem } from "@/services/role-service";
import { userService } from "@/services/user-service";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { formInputClass } from "@/components/ui/form-styles";
import { useRealtime } from "@/providers/realtime-provider";

export function CreatePrimaryUserForm({
  companyId,
  companyName,
  activities,
}: {
  companyId: string;
  companyName?: string | null;
  activities: Array<{ id: string; nom: string; type: string }>;
}) {
  const router = useRouter();
  const { pushToast } = useRealtime();
  const clearSession = useAppStore((state) => state.clearSession);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<null | {
    email: string;
    motDePasse: string;
    nomComplet: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    roleService.list().then(setRoles).catch(() => undefined);
  }, []);

  const principalRoleId = useMemo(() => {
    return (
      roles.find((role) => role.nom === "admin_entreprise")?.id ??
      roles.find((role) => role.nom === "manager")?.id ??
      ""
    );
  }, [roles]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!principalRoleId || !activities.length) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await userService.create({
        companyId,
        nom,
        prenom,
        email,
        telephone: telephone || undefined,
        motDePasse,
        assignments: activities.map((activity) => ({
          activityId: activity.id,
          roleId: principalRoleId,
        })),
      });

      setCreatedCredentials({
        email,
        motDePasse,
        nomComplet: `${prenom} ${nom}`,
      });
      pushToast({
        title: "Utilisateur principal cree",
        description: `${prenom} ${nom} peut maintenant se connecter a cette entreprise.`,
        tone: "success",
      });
      setNom("");
      setPrenom("");
      setEmail("");
      setTelephone("");
      setMotDePasse("");
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
        setError(error.response.data.message);
      } else {
        setError("Impossible de creer l'utilisateur principal pour cette entreprise.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogoutAndTest() {
    try {
      await authService.logout();
    } catch {
      // Ignore already-expired sessions.
    }

    clearSession();
    clearAllSessionCookies();
    router.push("/login");
  }

  return (
    <div className="surface grid gap-5 p-5">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Etape 3</p>
        <h3 className="mt-2 font-display text-2xl text-ink">Utilisateur principal</h3>
        <p className="mt-1 text-sm text-slate-500">
          Creez le compte principal qui utilisera <span className="font-semibold text-slate-700">{companyName ?? "cette entreprise"}</span> apres votre deconnexion.
        </p>
      </div>

      {!activities.length ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Ajoutez d'abord au moins une activite a cette entreprise avant de creer son utilisateur principal.
        </div>
      ) : null}

      {createdCredentials ? (
        <div className="grid gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Compte principal cree avec succes</p>
            <p className="mt-1 text-sm text-emerald-800">{createdCredentials.nomComplet}</p>
          </div>
          <div className="grid gap-2 text-sm text-emerald-900">
            <p>Email: <span className="font-semibold">{createdCredentials.email}</span></p>
            <p>Mot de passe: <span className="font-semibold">{createdCredentials.motDePasse}</span></p>
          </div>
          <Button type="button" className="bg-emerald-700 hover:bg-emerald-800" onClick={handleLogoutAndTest}>
            Se deconnecter et tester ce compte
          </Button>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              placeholder="Nom"
              className={formInputClass}
              required
            />
            <input
              value={prenom}
              onChange={(event) => setPrenom(event.target.value)}
              placeholder="Prenom"
              className={formInputClass}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email de connexion"
              type="email"
              className={formInputClass}
              required
            />
            <input
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
              placeholder="Telephone"
              className={formInputClass}
            />
          </div>
          <input
            value={motDePasse}
            onChange={(event) => setMotDePasse(event.target.value)}
            placeholder="Mot de passe"
            type="password"
            className={formInputClass}
            required
          />
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-700">Affectation automatique</p>
            <p className="mt-1 text-sm text-slate-500">
              Ce compte recevra le role <span className="font-semibold text-slate-700">admin_entreprise</span> sur toutes les activites de cette entreprise.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activities.map((activity) => (
                <span key={activity.id} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  {activity.nom}
                </span>
              ))}
            </div>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button disabled={loading || !principalRoleId || !activities.length}>
            {loading ? "Creation..." : "Creer l'utilisateur principal"}
          </Button>
        </form>
      )}
    </div>
  );
}
