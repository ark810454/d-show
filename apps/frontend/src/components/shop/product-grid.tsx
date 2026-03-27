"use client";

type ProductGridProps = {
  products: any[];
  onAdd: (product: any) => void;
};

export function ProductGrid({ products, onAdd }: ProductGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <button key={product.id} onClick={() => onAdd(product)} className="surface min-h-44 overflow-hidden p-0 text-left transition hover:-translate-y-1">
          <div className="h-28 bg-[radial-gradient(circle_at_top,rgba(14,95,89,0.18),transparent_55%),linear-gradient(135deg,#f8fafc,#e2e8f0)]" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{product.sku}</p>
                <h3 className="mt-2 font-display text-2xl text-ink">{product.nom}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stockActuel <= product.stockMinimum ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                Stock {product.stockActuel}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{product.categorie?.nom ?? "Sans categorie"}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Cliquer pour editer</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-display text-3xl text-pine">{Number(product.prixVente).toLocaleString("fr-FR")} FCFA</span>
              {product.promotions?.[0] ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{product.promotions[0].nom}</span>
              ) : null}
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}
