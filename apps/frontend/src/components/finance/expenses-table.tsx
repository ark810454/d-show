"use client";

import { EmptyState } from "@/components/ui/feedback";
import { tableCellClass, tableHeaderRowClass, tablePanelClass, tableRowClass } from "@/components/ui/table-styles";

export function ExpensesTable({ items }: { items: any[] }) {
  return (
    <section className={tablePanelClass}>
      <h3 className="font-display text-2xl text-ink">Depenses recentes</h3>
      {!items.length ? (
        <div className="mt-4">
          <EmptyState
            title="Aucune depense sur cette periode"
            description="Les depenses saisies apparaitront ici avec leur categorie, leur date et leur activite."
          />
        </div>
      ) : null}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className={tableHeaderRowClass}>
              <th className={tableCellClass}>Date</th>
              <th className={tableCellClass}>Categorie</th>
              <th className={tableCellClass}>Activite</th>
              <th className={tableCellClass}>Description</th>
              <th className={tableCellClass}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={tableRowClass}>
                <td className={tableCellClass}>{new Date(item.dateTransaction).toLocaleDateString("fr-FR")}</td>
                <td className={tableCellClass}>{item.financeAccount?.nom ?? "-"}</td>
                <td className={tableCellClass}>{item.activity?.nom ?? "Globale entreprise"}</td>
                <td className={tableCellClass}>{item.description}</td>
                <td className={`${tableCellClass} font-semibold text-rose-600`}>{Number(item.montant).toLocaleString("fr-FR")} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
