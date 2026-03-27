"use client";

import Link from "next/link";
import type { Route } from "next";
import { BarChart3, ChefHat, CreditCard, LayoutGrid, Settings2, Soup, WalletCards } from "lucide-react";
import { useMemo } from "react";
import { canAccessPath } from "@/lib/permissions";
import { useAppStore } from "@/store/app-store";

const modules = [
  {
    title: "Salle & tables",
    description: "Creer les tables, suivre libre/occupee/reservee/en nettoyage et piloter la salle en grille visuelle.",
    href: "/restaurant/tables",
    icon: LayoutGrid,
  },
  {
    title: "Menu digital",
    description: "Organiser categories, plats, boissons, desserts, options et supplements.",
    href: "/restaurant/menu",
    icon: Soup,
  },
  {
    title: "Prise de commande",
    description: "Associer une commande a une table, un serveur, des articles, des quantites et des notes cuisine.",
    href: "/restaurant/orders",
    icon: ChefHat,
  },
  {
    title: "Cuisine",
    description: "Recevoir les tickets en temps reel et faire avancer les statuts jusqu'a pret et servi.",
    href: "/restaurant/kitchen",
    icon: ChefHat,
  },
  {
    title: "Encaissement",
    description: "Encaisser cash, carte ou mobile money et preparer le recu de la commande.",
    href: "/restaurant/cashier",
    icon: CreditCard,
  },
  {
    title: "Statistiques",
    description: "Suivre plats vendus, volume de commandes, chiffre d'affaires et temps de preparation.",
    href: "/restaurant/stats",
    icon: BarChart3,
  },
  {
    title: "Finance",
    description: "Analyser les revenus et depenses du restaurant dans le contexte de l'entreprise active.",
    href: "/finance",
    icon: WalletCards,
  },
  {
    title: "Configuration",
    description: "Centraliser les parametres operationnels du restaurant sans sortir de l'activite.",
    href: "/restaurant/settings",
    icon: Settings2,
  },
];

export default function RestaurantPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const stats = useMemo(
    () => [
      { label: "Entreprise active", value: activeContext.companyName ?? "Non definie" },
      { label: "Activite", value: activeContext.activityName ?? "Restaurant" },
      { label: "Scope", value: "Donnees isolees par entreprise et activite" },
    ],
    [activeContext.activityName, activeContext.companyName],
  );
  const visibleModules = useMemo(
    () =>
      modules.filter((item) =>
        canAccessPath({
          pathname: item.href,
          user,
          activityId: activeContext.activityId,
          activityType: activeContext.activityType,
        }),
      ),
    [activeContext.activityId, activeContext.activityType, user],
  );

  return (
    <main className="grid gap-6">
      <section className="surface overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-ink px-6 py-8 text-white lg:px-8">
            <p className="text-sm uppercase tracking-[0.2em] text-white/55">Restaurant</p>
            <h1 className="mt-4 font-display text-4xl">Dashboard operationnel du restaurant</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/75">
              Travaillez uniquement dans le restaurant selectionne, avec ses tables, son menu, ses commandes, sa cuisine,
              son encaissement et ses chiffres.
            </p>
          </div>
          <div className="grid gap-3 bg-gradient-to-br from-white to-slate-50 px-6 py-8 lg:px-8">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleModules.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href as Route} className="surface group p-6 transition hover:-translate-y-1 hover:border-pine/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine text-white">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl text-ink">{title}</h2>
            <p className="mt-3 text-sm text-slate-500">{description}</p>
            <p className="mt-5 text-sm font-semibold text-gold">Ouvrir le module</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
