"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, GlassWater, KeyRound, LayoutGrid, Sparkles, TrendingUp } from "lucide-react";
import { ActivityType } from "@dshow/shared";
import { PromotionBanner } from "@/components/terrace/promotion-banner";
import { canAccessPath } from "@/lib/permissions";
import { terraceService } from "@/services/terrace-service";
import { useAppStore } from "@/store/app-store";

const shortcuts = [
  {
    title: "Zones exterieures",
    description: "Superviser les tables, zones lounge et occupation en direct.",
    href: "/terrace/tables",
    icon: LayoutGrid,
    tone: "from-slate-900 to-slate-700",
  },
  {
    title: "POS rapide",
    description: "Prendre une commande boisson ou mixte en quelques tapes.",
    href: "/terrace/pos",
    icon: GlassWater,
    tone: "from-teal-700 to-emerald-500",
  },
  {
    title: "Encaissement",
    description: "Encaisser cash, carte ou mobile money avec ticket simplifie.",
    href: "/terrace/cashier",
    icon: CreditCard,
    tone: "from-amber-600 to-yellow-400",
  },
  {
    title: "Statistiques",
    description: "Suivre les ventes, heures fortes et impact happy hour.",
    href: "/terrace/stats",
    icon: TrendingUp,
    tone: "from-indigo-700 to-sky-500",
  },
  {
    title: "Configuration",
    description: "Regrouper les acces equipe et les reglages utiles de la terrasse.",
    href: "/terrace/settings",
    icon: KeyRound,
    tone: "from-slate-800 to-slate-500",
  },
];

export default function TerracePage() {
  const user = useAppStore((state) => state.user);
  const activeContext = useAppStore((state) => state.activeContext);
  const [promotions, setPromotions] = useState<any[]>([]);

  useEffect(() => {
    terraceService.happyHours().then(setPromotions).catch(() => undefined);
  }, []);

  const visibleShortcuts = useMemo(
    () =>
      shortcuts.filter((item) =>
        canAccessPath({
          pathname: item.href,
          user,
          activityId: activeContext.activityId,
          activityType: activeContext.activityType ?? ActivityType.TERRASSE,
        }),
      ),
    [activeContext.activityId, activeContext.activityType, user],
  );

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        <section className="surface overflow-hidden p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Terrasse</p>
              <h1 className="mt-3 font-display text-4xl text-ink lg:text-5xl">Service exterieur rapide, fluide et premium.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Pilotez les boissons, les commandes express, les promotions happy hour et l&apos;encaissement sans perdre de temps en salle.
              </p>
            </div>
            <div className="rounded-[2rem] bg-gradient-to-br from-teal-900 via-teal-700 to-emerald-500 p-6 text-white shadow-2xl shadow-teal-900/20">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-white/70">
                <Sparkles className="h-4 w-4" />
                Experience terrasse
              </div>
              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-white/12 p-4 backdrop-blur">
                  <p className="text-sm text-white/70">Promotions actives</p>
                  <p className="mt-2 font-display text-4xl">{promotions.length}</p>
                </div>
                <p className="text-sm leading-6 text-white/80">
                  L&apos;interface est optimisee pour tablette avec gros boutons, lecture rapide des statuts et encaissement express.
                </p>
              </div>
            </div>
          </div>
        </section>

        <PromotionBanner promotions={promotions} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleShortcuts.map(({ title, description, href, icon: Icon, tone }) => (
            <Link
              key={href}
              href={href as Route}
              className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`h-32 bg-gradient-to-br ${tone} p-5 text-white`}>
                <Icon className="h-8 w-8" />
              </div>
              <div className="p-5">
                <h2 className="font-display text-2xl text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-pine transition group-hover:translate-x-1">
                  Ouvrir le module
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
