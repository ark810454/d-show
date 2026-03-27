"use client";

export function LowStockWidget({ items }: { items: any[] }) {
  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-ink">Alertes stock faible</h3>
          <p className="text-sm text-slate-500">Produits a reapprovisionner rapidement.</p>
        </div>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">{items.length} alertes</span>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-rose-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-700">{item.nom}</p>
              <span className="text-sm font-semibold text-rose-700">{item.stockActuel} / {item.stockMinimum}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{item.categorie?.nom ?? "Sans categorie"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
