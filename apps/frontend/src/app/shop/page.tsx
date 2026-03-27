"use client";

import Link from "next/link";
import type { Route } from "next";
import { BarChart3, KeyRound, ReceiptText, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActivityType } from "@dshow/shared";
import axios from "axios";
import { ProductGrid } from "@/components/shop/product-grid";
import { LowStockWidget } from "@/components/shop/low-stock-widget";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { formInputClass, formPanelClass, formSelectClass, formTextareaClass } from "@/components/ui/form-styles";
import { canAccessPath } from "@/lib/permissions";
import { useRealtime } from "@/providers/realtime-provider";
import { shopService } from "@/services/shop-service";
import { useAppStore } from "@/store/app-store";

const shortcuts = [
  {
    title: "POS boutique",
    description: "Encaisser rapidement, gerer le panier et rechercher les produits.",
    href: "/shop/pos",
    icon: ReceiptText,
  },
  {
    title: "Produits & stock",
    description: "Suivre le catalogue, les alertes stock faible et les mouvements.",
    href: "/shop/inventory",
    icon: ShoppingBag,
  },
  {
    title: "Statistiques",
    description: "Voir les meilleures ventes, la marge estimee et les tendances.",
    href: "/shop/stats",
    icon: BarChart3,
  },
  {
    title: "Configuration",
    description: "Retrouver la matrice d'acces et les points de controle de la boutique.",
    href: "/shop/settings",
    icon: KeyRound,
  },
];

const emptyForm = {
  id: "",
  nom: "",
  sku: "",
  codeBarres: "",
  categoryId: "",
  prixAchat: "",
  prixVente: "",
  stockActuel: "",
  stockMinimum: "",
  description: "",
  statut: "ACTIVE",
};

function buildSkuPreview(name: string, existingProducts: any[]) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .trim()
    .toUpperCase();
  const compact = normalized.replace(/\s+/g, "");
  const prefix = (compact.slice(0, 3) || "PRD").padEnd(3, "X");
  let next = 1;

  for (const product of existingProducts) {
    const match = String(product.sku ?? "").match(new RegExp(`^${prefix}(\\d+)$`));
    if (!match) continue;
    next = Math.max(next, Number(match[1]) + 1);
  }

  return `${prefix}${String(next).padStart(3, "0")}`;
}

export default function ShopPage() {
  const router = useRouter();
  const pushToast = useRealtime().pushToast;
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [products, setProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState({ nom: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function mapProductToForm(product: any) {
    return {
      id: product.id,
      nom: product.nom ?? "",
      sku: product.sku ?? "",
      codeBarres: product.codeBarres ?? "",
      categoryId: product.categoryId ?? "",
      prixAchat: product.prixAchat ? String(product.prixAchat) : "",
      prixVente: product.prixVente ? String(product.prixVente) : "",
      stockActuel: String(product.stockActuel ?? 0),
      stockMinimum: String(product.stockMinimum ?? 0),
      description: product.description ?? "",
      statut: product.statut ?? "ACTIVE",
    };
  }

  async function load() {
    try {
      setLoading(true);
      const [productData, lowStockData, categoryData] = await Promise.all([
        shopService.products(),
        shopService.lowStock(),
        shopService.categories(),
      ]);
      setProducts(productData);
      setLowStock(lowStockData);
      setCategories(categoryData);
      setError(null);
    } catch (loadError) {
      if (axios.isAxiosError(loadError) && loadError.response?.data?.message) {
        setError(
          Array.isArray(loadError.response.data.message)
            ? loadError.response.data.message.join(", ")
            : String(loadError.response.data.message),
        );
      } else {
        setError("Impossible de charger les produits de la boutique.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!activeContext.companyId || !activeContext.activityId) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        companyId: activeContext.companyId,
        activityId: activeContext.activityId,
        categoryId: form.categoryId || undefined,
        nom: form.nom,
        sku: selectedProduct ? form.sku : undefined,
        codeBarres: form.codeBarres || undefined,
        prixAchat: form.prixAchat ? Number(form.prixAchat) : undefined,
        prixVente: Number(form.prixVente),
        stockActuel: Number(form.stockActuel || 0),
        stockMinimum: Number(form.stockMinimum || 0),
        description: form.description || undefined,
        statut: form.statut,
      };

      if (selectedProduct) {
        await shopService.updateProduct(selectedProduct.id, payload);
        pushToast({
          title: "Produit mis a jour",
          description: `${form.nom} a ete modifie avec succes.`,
          tone: "success",
        });
      } else {
        await shopService.createProduct(payload);
        pushToast({
          title: "Produit cree",
          description: `${form.nom} a ete ajoute au catalogue.`,
          tone: "success",
        });
      }

      setSelectedProduct(null);
      setForm(emptyForm);
      await load();
    } catch (submitError) {
      if (axios.isAxiosError(submitError) && submitError.response?.data?.message) {
        setError(
          Array.isArray(submitError.response.data.message)
            ? submitError.response.data.message.join(", ")
            : String(submitError.response.data.message),
        );
      } else {
        setError("Impossible d'enregistrer ce produit.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCategory() {
    if (!activeContext.companyId || !activeContext.activityId || !categoryForm.nom) {
      return;
    }

    setSavingCategory(true);
    try {
      const created = await shopService.createCategory({
        companyId: activeContext.companyId,
        activityId: activeContext.activityId,
        nom: categoryForm.nom,
        description: categoryForm.description || undefined,
      });
      setCategories((state) => [...state, created].sort((a, b) => a.nom.localeCompare(b.nom)));
      setCategoryForm({ nom: "", description: "" });
      setForm((state) => ({ ...state, categoryId: created.id }));
      pushToast({
        title: "Categorie creee",
        description: `${created.nom} est disponible pour les nouveaux produits.`,
        tone: "success",
      });
      setError(null);
    } catch (submitError) {
      if (axios.isAxiosError(submitError) && submitError.response?.data?.message) {
        setError(
          Array.isArray(submitError.response.data.message)
            ? submitError.response.data.message.join(", ")
            : String(submitError.response.data.message),
        );
      } else {
        setError("Impossible de creer la categorie.");
      }
    } finally {
      setSavingCategory(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (!activeContext.companyId) {
      router.replace("/select-company");
      return;
    }
    if (!activeContext.activityId || activeContext.activityType !== ActivityType.SHOP) {
      router.replace("/select-activity");
      return;
    }
    if (
      !canAccessPath({
        pathname: "/shop",
        user,
        activityId: activeContext.activityId,
        activityType: activeContext.activityType,
      })
    ) {
      router.replace("/select-activity");
      return;
    }
    void load();
  }, [hasHydrated, accessToken, activeContext.companyId, activeContext.activityId, activeContext.activityType, router, user]);

  if (
    !hasHydrated ||
    !accessToken ||
    !activeContext.companyId ||
    !activeContext.activityId ||
    !canAccessPath({
      pathname: "/shop",
      user,
      activityId: activeContext.activityId,
      activityType: activeContext.activityType,
    })
  ) {
    return (
      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto grid max-w-7xl gap-6">
          <SectionSkeleton cards={4} />
          <SectionSkeleton cards={3} />
        </div>
      </main>
    );
  }

  const generatedSku = selectedProduct ? form.sku : buildSkuPreview(form.nom, products);

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Boutique</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Catalogue & caisse</h1>
        </section>
        {error ? (
          <InlineFeedback tone="error">
            <p className="font-semibold">Module shop indisponible</p>
            <p className="mt-1">{error}</p>
          </InlineFeedback>
        ) : null}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts
            .filter((item) =>
              canAccessPath({
                pathname: item.href,
                user,
                activityId: activeContext.activityId,
                activityType: activeContext.activityType,
              }),
            )
            .map(({ title, description, href, icon: Icon }) => (
              <Link
                key={href}
                href={href as Route}
                className="surface group p-6 transition hover:-translate-y-1 hover:border-pine/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-2xl text-ink">{title}</h2>
                <p className="mt-3 text-sm text-slate-500">{description}</p>
                <p className="mt-5 text-sm font-semibold text-gold">Ouvrir le module</p>
              </Link>
            ))}
        </section>
        {loading ? (
          <>
            <SectionSkeleton cards={3} />
            <SectionSkeleton cards={2} />
          </>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-3xl text-ink">Produits recents</h2>
                    <p className="mt-2 text-sm text-slate-500">Cliquez sur une carte produit pour l'editer.</p>
                  </div>
                  <Button
                    type="button"
                    className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      setSelectedProduct(null);
                      setForm(emptyForm);
                    }}
                  >
                    Nouveau produit
                  </Button>
                </div>
                <ProductGrid
                  products={products.slice(0, 9)}
                  onAdd={(product) => {
                    setSelectedProduct(product);
                    setForm(mapProductToForm(product));
                  }}
                />
              </div>
              <section className={formPanelClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-3xl text-ink">
                      {selectedProduct ? "Editer le produit" : "Creer un produit"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Gerer le catalogue, le prix et le stock sans passer par la base.
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Categorie produit</p>
                  <div className="mt-3 grid gap-3">
                    <input
                      className={formInputClass}
                      placeholder="Nom de la categorie"
                      value={categoryForm.nom}
                      onChange={(e) => setCategoryForm((state) => ({ ...state, nom: e.target.value }))}
                    />
                    <input
                      className={formInputClass}
                      placeholder="Description (optionnel)"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm((state) => ({ ...state, description: e.target.value }))}
                    />
                    <Button
                      type="button"
                      disabled={!categoryForm.nom || savingCategory}
                      onClick={() => void handleCreateCategory()}
                    >
                      {savingCategory ? "Creation..." : "Creer la categorie"}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={formInputClass} placeholder="Nom du produit" value={form.nom} onChange={(e) => setForm((state) => ({ ...state, nom: e.target.value }))} />
                  <input
                    className={`${formInputClass} bg-slate-50`}
                    placeholder="Code produit automatique"
                    value={generatedSku}
                    readOnly
                  />
                  <input className={formInputClass} placeholder="Code-barres (optionnel)" value={form.codeBarres} onChange={(e) => setForm((state) => ({ ...state, codeBarres: e.target.value }))} />
                  <select className={formSelectClass} value={form.categoryId} onChange={(e) => setForm((state) => ({ ...state, categoryId: e.target.value }))}>
                    <option value="">Sans categorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nom}
                      </option>
                    ))}
                  </select>
                  <input className={formInputClass} placeholder="Prix d'achat" value={form.prixAchat} onChange={(e) => setForm((state) => ({ ...state, prixAchat: e.target.value }))} />
                  <input className={formInputClass} placeholder="Prix de vente" value={form.prixVente} onChange={(e) => setForm((state) => ({ ...state, prixVente: e.target.value }))} />
                  <input className={formInputClass} placeholder="Stock actuel" value={form.stockActuel} onChange={(e) => setForm((state) => ({ ...state, stockActuel: e.target.value }))} />
                  <input className={formInputClass} placeholder="Seuil stock faible" value={form.stockMinimum} onChange={(e) => setForm((state) => ({ ...state, stockMinimum: e.target.value }))} />
                  <select className={`${formSelectClass} md:col-span-2`} value={form.statut} onChange={(e) => setForm((state) => ({ ...state, statut: e.target.value }))}>
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Inactif</option>
                    <option value="RUPTURE">Rupture</option>
                  </select>
                  <textarea className={`${formTextareaClass} md:col-span-2`} placeholder="Description" value={form.description} onChange={(e) => setForm((state) => ({ ...state, description: e.target.value }))} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    disabled={!form.nom || !generatedSku || !form.prixVente || saving}
                    onClick={() => void handleSubmit()}
                  >
                    {saving ? "Enregistrement..." : selectedProduct ? "Mettre a jour" : "Creer le produit"}
                  </Button>
                  {selectedProduct ? (
                    <Button
                      type="button"
                      className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setSelectedProduct(null);
                        setForm(emptyForm);
                      }}
                    >
                      Annuler l'edition
                    </Button>
                  ) : null}
                </div>
              </section>
            </section>
            <LowStockWidget items={lowStock} />
          </>
        )}
      </div>
    </main>
  );
}
