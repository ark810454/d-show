"use client";

import { MenuItemStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { MenuCatalog } from "@/components/restaurant/menu-catalog";
import { Button } from "@/components/ui/button";
import { restaurantService } from "@/services/restaurant-service";
import { useAppStore } from "@/store/app-store";

export default function RestaurantMenuPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const [menu, setMenu] = useState<any[]>([]);
  const [categoryForm, setCategoryForm] = useState({ nom: "", description: "" });
  const [itemForm, setItemForm] = useState<{
    id: string;
    categoryId: string;
    nom: string;
    prix: string;
    description: string;
    statut: MenuItemStatus;
  }>({
    id: "",
    categoryId: "",
    nom: "",
    prix: "",
    description: "",
    statut: MenuItemStatus.DISPONIBLE,
  });
  const [filterCategoryId, setFilterCategoryId] = useState("all");

  async function loadMenu() {
    const data = await restaurantService.menu();
    setMenu(data);
  }

  useEffect(() => {
    void loadMenu();
  }, []);

  async function handleCreateCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeContext.companyId || !activeContext.activityId) return;
    await restaurantService.createCategory({
      companyId: activeContext.companyId,
      activityId: activeContext.activityId,
      nom: categoryForm.nom,
      description: categoryForm.description || undefined,
    });
    setCategoryForm({ nom: "", description: "" });
    await loadMenu();
  }

  async function handleSubmitItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeContext.companyId || !activeContext.activityId || !itemForm.categoryId) return;

    const payload = {
      companyId: activeContext.companyId,
      activityId: activeContext.activityId,
      categoryId: itemForm.categoryId,
      nom: itemForm.nom,
      prix: Number(itemForm.prix),
      description: itemForm.description || undefined,
      statut: itemForm.statut,
    };

    if (itemForm.id) {
      await restaurantService.updateMenuItem(itemForm.id, payload);
    } else {
      await restaurantService.createMenuItem(payload);
    }

    setItemForm({
      id: "",
      categoryId: itemForm.categoryId,
      nom: "",
      prix: "",
      description: "",
      statut: MenuItemStatus.DISPONIBLE,
    });
    await loadMenu();
  }

  const categories = menu.map((category) => ({
    id: category.id,
    nom: category.nom,
  }));

  const filteredMenu =
    filterCategoryId === "all" ? menu : menu.filter((category) => category.id === filterCategoryId);

  return (
    <div className="grid gap-6">
      <section className="surface flex items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Restaurant</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Menu digital</h1>
          <p className="mt-2 text-sm text-slate-500">
            Saisissez vos categories, vos plats et leurs prix, puis filtrez le catalogue selon la categorie.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p>Total categories</p>
          <p className="font-semibold text-slate-800">{menu.length}</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={handleCreateCategory} className="surface grid gap-4 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Categorie</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Nouvelle categorie</h2>
          </div>
          <input
            value={categoryForm.nom}
            onChange={(event) => setCategoryForm((state) => ({ ...state, nom: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            placeholder="Ex: Plats, Boissons, Desserts"
            required
          />
          <textarea
            value={categoryForm.description}
            onChange={(event) => setCategoryForm((state) => ({ ...state, description: event.target.value }))}
            className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            placeholder="Description de la categorie"
          />
          <Button type="submit">Ajouter la categorie</Button>
        </form>

        <form onSubmit={handleSubmitItem} className="surface grid gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Plat</p>
              <h2 className="mt-2 font-display text-3xl text-ink">
                {itemForm.id ? "Modifier le plat" : "Nouveau plat"}
              </h2>
            </div>
            {itemForm.id ? (
              <button
                type="button"
                onClick={() =>
                  setItemForm({
                    id: "",
                    categoryId: "",
                    nom: "",
                    prix: "",
                    description: "",
                    statut: MenuItemStatus.DISPONIBLE,
                  })
                }
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600"
              >
                Annuler
              </button>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={itemForm.categoryId}
              onChange={(event) => setItemForm((state) => ({ ...state, categoryId: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              required
            >
              <option value="">Choisir une categorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
            <select
              value={itemForm.statut}
              onChange={(event) =>
                setItemForm((state) => ({ ...state, statut: event.target.value as MenuItemStatus }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            >
              {Object.values(MenuItemStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <input
              value={itemForm.nom}
              onChange={(event) => setItemForm((state) => ({ ...state, nom: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              placeholder="Nom du plat"
              required
            />
            <input
              value={itemForm.prix}
              onChange={(event) => setItemForm((state) => ({ ...state, prix: event.target.value }))}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              placeholder="Prix"
              inputMode="decimal"
              required
            />
          </div>
          <textarea
            value={itemForm.description}
            onChange={(event) => setItemForm((state) => ({ ...state, description: event.target.value }))}
            className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none"
            placeholder="Description du plat"
          />
          <Button type="submit">{itemForm.id ? "Mettre a jour le plat" : "Ajouter le plat"}</Button>
        </form>
      </section>

      <section className="surface grid gap-4 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Catalogue</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Plats par categorie</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterCategoryId("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                filterCategoryId === "all" ? "bg-pine text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              Toutes les categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFilterCategoryId(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  filterCategoryId === category.id ? "bg-pine text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {category.nom}
              </button>
            ))}
          </div>
        </div>

        <MenuCatalog
          categories={filteredMenu}
          onEditItem={(item) =>
            setItemForm({
              id: item.id,
              categoryId: item.categoryId,
              nom: item.nom,
              prix: String(item.prix),
              description: item.description ?? "",
              statut: item.statut,
            })
          }
        />
      </section>
    </div>
  );
}
