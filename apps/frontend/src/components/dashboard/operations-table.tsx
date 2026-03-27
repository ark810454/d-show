"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { operationalRows } from "@/services/dashboard-service";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formInputClass, formSelectClass, formTextareaClass } from "@/components/ui/form-styles";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import {
  tableCellClass,
  tableFilterWrapClass,
  tableHeaderRowClass,
  tablePanelClass,
  tableRowClass,
} from "@/components/ui/table-styles";

export function OperationsTable() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(operationalRows.length / pageSize));
  const paginatedRows = operationalRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <section className={tablePanelClass}>
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-display text-2xl text-ink">Operations en cours</h3>
            <p className="text-sm text-slate-500">Recherche, filtres, pagination et actions rapides.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className={tableFilterWrapClass}>
              <Search className="h-4 w-4" />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="Rechercher commande, reservation..."
              />
            </label>
            <Button className="bg-gold text-white hover:bg-amber-600" onClick={() => setOpen(true)}>
              Nouvelle saisie
            </Button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={tableHeaderRowClass}>
                <th className={tableCellClass}>Reference</th>
                <th className={tableCellClass}>Client / Poste</th>
                <th className={tableCellClass}>Activite</th>
                <th className={tableCellClass}>Montant</th>
                <th className={tableCellClass}>Statut</th>
                <th className={tableCellClass}>Agent</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row.reference} className={tableRowClass}>
                  <td className={`${tableCellClass} font-semibold text-slate-700`}>{row.reference}</td>
                  <td className={tableCellClass}>{row.customer}</td>
                  <td className={tableCellClass}>{row.activity}</td>
                  <td className={tableCellClass}>{row.amount}</td>
                  <td className={tableCellClass}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={tableCellClass}>{row.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
      </section>

      <Modal
        open={open}
        title="Nouvelle saisie operationnelle"
        description="Le flux respecte l’ordre entreprise -> activite -> donnees."
      >
        <form className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-600">Entreprise</label>
            <input className={formInputClass} defaultValue="D_Show Complex" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-600">Activite</label>
            <select className={formSelectClass}>
              <option>Restaurant</option>
              <option>Terrasse</option>
              <option>Boite de nuit</option>
              <option>Boutique</option>
              <option>Cordonnerie</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-600">Description</label>
            <textarea className={formTextareaClass} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" className="bg-white text-slate-700 hover:bg-slate-100" onClick={() => setOpen(false)}>
              Fermer
            </Button>
            <Button type="submit" className="bg-pine hover:bg-teal-800">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
