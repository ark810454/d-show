"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { EmptyState } from "@/components/ui/feedback";
import { formInputClass, formSelectClass } from "@/components/ui/form-styles";
import { Pagination } from "@/components/ui/pagination";
import {
  tableCellClass,
  tableHeaderRowClass,
  tablePanelClass,
  tableRowClass,
} from "@/components/ui/table-styles";
import type { UserItem } from "@/services/user-service";

export function UsersTable({
  users,
  canDelete,
  onEdit,
  onDeactivate,
  onDelete,
}: {
  users: UserItem[];
  canDelete: boolean;
  onEdit: (user: UserItem) => void;
  onDeactivate: (user: UserItem) => Promise<void>;
  onDelete: (user: UserItem) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery =
        !query ||
        `${user.prenom} ${user.nom}`.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" || user.statut === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, users]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  return (
    <section className={tablePanelClass}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-display text-2xl text-ink">Utilisateurs</h3>
          <p className="text-sm text-slate-500">Filtres, roles par activite et suivi du statut.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className={formInputClass} />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={formSelectClass}>
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="INACTIVE">Inactifs</option>
            <option value="SUSPENDED">Suspendus</option>
          </select>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState
            title="Aucun utilisateur trouve"
            description="Ajustez vos filtres ou creez un nouvel utilisateur pour commencer."
          />
        ) : null}
        {filtered.length > 0 ? (
        <table className="min-w-full">
          <thead>
            <tr className={tableHeaderRowClass}>
              <th className={tableCellClass}>Utilisateur</th>
              <th className={tableCellClass}>Contact</th>
              <th className={tableCellClass}>Roles</th>
              <th className={tableCellClass}>Statut</th>
              <th className={tableCellClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user) => (
              <tr key={user.id} className={tableRowClass}>
                <td className={tableCellClass}>
                  <div className="font-semibold text-slate-700">{user.prenom} {user.nom}</div>
                </td>
                <td className={tableCellClass}>
                  <div>{user.email}</div>
                  <div className="text-xs text-slate-400">{user.telephone ?? "N/A"}</div>
                </td>
                <td className={tableCellClass}>
                  <div className="flex flex-wrap gap-2">
                    {user.assignments.map((assignment) => (
                      <span key={assignment.id ?? `${assignment.activityId}-${assignment.roleId}`} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {assignment.role?.nom} / {assignment.activity?.nom}
                      </span>
                    ))}
                  </div>
                </td>
                <td className={tableCellClass}>
                  <StatusBadge status={user.statut} />
                </td>
                <td className={tableCellClass}>
                  <div className="flex gap-2">
                    <Button className="bg-white text-slate-700 hover:bg-slate-100" onClick={() => onEdit(user)}>
                      Modifier
                    </Button>
                    <ConfirmAction
                      title="Desactiver cet utilisateur"
                      description={`Le compte de ${user.prenom} ${user.nom} sera desactive, mais son historique restera conserve.`}
                      confirmLabel="Confirmer la desactivation"
                      onConfirm={() => onDeactivate(user)}
                    >
                      <Button className="bg-rose-600 hover:bg-rose-700">Desactiver</Button>
                    </ConfirmAction>
                    {canDelete ? (
                      <ConfirmAction
                        title="Supprimer logiquement cet utilisateur"
                        description={`Le compte de ${user.prenom} ${user.nom} sera retire des usages courants, sans effacer l'historique.`}
                        confirmLabel="Confirmer la suppression"
                        onConfirm={() => onDelete(user)}
                      >
                        <Button className="bg-slate-800 hover:bg-slate-900">Supprimer</Button>
                      </ConfirmAction>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : null}
      </div>
      <Pagination page={Math.min(page, pageCount)} pageCount={pageCount} onChange={setPage} />
    </section>
  );
}
