"use client";

import Link from "next/link";
import type { Route } from "next";
import { Disc3, KeyRound, QrCode, Ticket, Wine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActivityType } from "@dshow/shared";
import { NightclubDashboard } from "@/components/nightclub/nightclub-dashboard";
import { InlineFeedback, SectionSkeleton } from "@/components/ui/feedback";
import { useNightclubSocket } from "@/hooks/nightclub/use-nightclub-socket";
import { canAccessPath } from "@/lib/permissions";
import { nightclubService } from "@/services/nightclub-service";
import { useAppStore } from "@/store/app-store";

const shortcuts = [
  {
    title: "Billetterie",
    description: "Creer les tickets standard et VIP avec QR code unique.",
    href: "/nightclub/ticketing",
    icon: Ticket,
  },
  {
    title: "Evenements",
    description: "Piloter les soirees, les DJ invites et les prix d'entree.",
    href: "/nightclub/events",
    icon: Disc3,
  },
  {
    title: "Bouteilles",
    description: "Gerer la carte bouteilles, les commandes et l'encaissement VIP.",
    href: "/nightclub/bottles",
    icon: Wine,
  },
  {
    title: "Scan & acces",
    description: "Valider les tickets en direct et suivre les controles d'entree.",
    href: "/nightclub/scan",
    icon: QrCode,
  },
  {
    title: "Configuration",
    description: "Centraliser la matrice d'acces et les reglages du module nightlife.",
    href: "/nightclub/settings",
    icon: KeyRound,
  },
];

export default function NightclubPage() {
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const accessToken = useAppStore((state) => state.accessToken);
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const response = await nightclubService.dashboard();
      setData(response);
      setError(null);
    } catch (loadError: any) {
      setError(loadError?.response?.data?.message ?? "Impossible de charger le dashboard boite de nuit.");
    } finally {
      setLoading(false);
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
    if (!activeContext.activityId || activeContext.activityType !== ActivityType.BOITE_NUIT) {
      router.replace("/select-activity");
      return;
    }
    if (
      !canAccessPath({
        pathname: "/nightclub",
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

  useNightclubSocket({
    "nightclub.ticket.created": () => void load(),
    "nightclub.ticket.validated": () => void load(),
    "nightclub.reservation.updated": () => void load(),
    "nightclub.bottle.updated": () => void load(),
  });

  if (
    !hasHydrated ||
    !accessToken ||
    !activeContext.companyId ||
    !activeContext.activityId ||
    !canAccessPath({
      pathname: "/nightclub",
      user,
      activityId: activeContext.activityId,
      activityType: activeContext.activityType,
    })
  ) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.18),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] p-4 lg:p-6">
        <div className="mx-auto grid max-w-7xl gap-6">
          <SectionSkeleton cards={4} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(217,70,239,0.18),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6">
        {error ? (
          <InlineFeedback tone="error">
            <p className="font-semibold">Module boite de nuit indisponible</p>
            <p className="mt-1">{error}</p>
          </InlineFeedback>
        ) : null}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                className="rounded-[2rem] border border-white/10 bg-white/5 p-5 text-white backdrop-blur transition hover:-translate-y-1 hover:border-fuchsia-400/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-display text-2xl">{title}</h2>
                <p className="mt-3 text-sm text-slate-300">{description}</p>
              </Link>
            ))}
        </section>
        {loading ? <SectionSkeleton cards={3} /> : <NightclubDashboard data={data} />}
      </div>
    </main>
  );
}
