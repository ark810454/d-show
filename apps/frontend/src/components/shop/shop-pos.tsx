"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formInputClass, formSelectClass } from "@/components/ui/form-styles";

type ShopPosProps = {
  products: any[];
  companyId?: string | null;
  activityId?: string | null;
  userId?: string;
  onSearch: (query: string) => void;
  onSubmit: (payload: any) => Promise<any>;
};

export function ShopPos({ products, companyId, activityId, userId, onSearch, onSubmit }: ShopPosProps) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [remise, setRemise] = useState("0");
  const [taxe, setTaxe] = useState("0");
  const [modePaiement, setModePaiement] = useState("CASH");
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.quantite * item.prixUnitaire, 0), [cart]);
  const total = Math.max(0, subtotal - Number(remise || 0) + Number(taxe || 0));

  function addToCart(product: any) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) => item.productId === product.id ? { ...item, quantite: item.quantite + 1 } : item);
      }
      return [...current, { productId: product.id, libelle: product.nom, quantite: 1, prixUnitaire: Number(product.prixVente) }];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => item.productId === productId ? { ...item, quantite: Math.max(1, item.quantite + delta) } : item)
        .filter(Boolean),
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="grid gap-4">
        <div className="surface p-5">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <input
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                onSearch(value);
              }}
              placeholder="Rechercher par nom, code ou code-barres"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <button key={product.id} onClick={() => addToCart(product)} className="surface p-5 text-left transition hover:-translate-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{product.sku}</p>
              <h3 className="mt-2 font-display text-2xl text-ink">{product.nom}</h3>
              <p className="mt-2 text-sm text-slate-500">{product.codeBarres ?? "Sans code-barres"}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-3xl text-pine">{Number(product.prixVente).toLocaleString("fr-FR")} FCFA</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stockActuel <= product.stockMinimum ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
                  {product.stockActuel}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="surface h-fit p-5">
        <h2 className="font-display text-3xl text-ink">Panier</h2>
        <div className="mt-4 grid gap-3">
          {cart.map((item) => (
            <div key={item.productId} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-700">{item.libelle}</p>
                  <p className="mt-1 text-sm text-slate-500">{Number(item.prixUnitaire).toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="h-8 w-8 rounded-full bg-white text-sm shadow">-</button>
                  <span className="min-w-8 text-center text-sm font-semibold">{item.quantite}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="h-8 w-8 rounded-full bg-white text-sm shadow">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          <input value={remise} onChange={(e) => setRemise(e.target.value)} placeholder="Remise" className={formInputClass} />
          <input value={taxe} onChange={(e) => setTaxe(e.target.value)} placeholder="Taxes" className={formInputClass} />
          <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)} className={formSelectClass}>
            <option value="CASH">CASH</option>
            <option value="CARTE">CARTE</option>
            <option value="MOBILE_MONEY">MOBILE_MONEY</option>
          </select>
        </div>
        <div className="mt-5 space-y-2 text-sm text-slate-500">
          <div className="flex items-center justify-between"><span>Sous-total</span><span>{subtotal.toLocaleString("fr-FR")} FCFA</span></div>
          <div className="flex items-center justify-between"><span>Remise</span><span>- {Number(remise || 0).toLocaleString("fr-FR")} FCFA</span></div>
          <div className="flex items-center justify-between"><span>Taxes</span><span>{Number(taxe || 0).toLocaleString("fr-FR")} FCFA</span></div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total</span>
          <span className="font-display text-4xl text-ink">{total.toLocaleString("fr-FR")} FCFA</span>
        </div>
        <Button
          className="mt-5 w-full"
          disabled={!companyId || !activityId || cart.length === 0}
          onClick={() => onSubmit({ companyId, activityId, sellerId: userId, remise: Number(remise || 0), taxeMontant: Number(taxe || 0), modePaiement, items: cart })}
        >
          Valider la vente
        </Button>
      </section>
    </div>
  );
}
