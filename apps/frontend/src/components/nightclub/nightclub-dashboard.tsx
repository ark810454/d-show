"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo } from "react";
import { CreditCard, QrCode, ShieldCheck, Ticket, Wine } from "lucide-react";
import { ActivityType } from "@dshow/shared";
import { canAccessPath } from "@/lib/permissions";
import { useAppStore } from "@/store/app-store";

export function NightclubDashboard({ data }: { data: any }) {
  const user = useAppStore((state) => state.user);
  const activeContext = useAppStore((state) => state.activeContext);
  const kpis = [
    { label: "Entrees validees", value: data?.kpis?.totalEntries ?? 0, icon: Ticket },
    { label: "Revenus billetterie", value: `${Number(data?.kpis?.ticketRevenue ?? 0).toLocaleString("fr-FR")} FCFA`, icon: CreditCard },
    { label: "Reservations", value: data?.kpis?.reservations ?? 0, icon: ShieldCheck },
    { label: "Ventes bouteilles", value: `${Number(data?.kpis?.bottleSales ?? 0).toLocaleString("fr-FR")} FCFA`, icon: Wine },
  ];

  const shortcuts = [
    { href: "/nightclub/ticketing", label: "Billetterie", icon: Ticket },
    { href: "/nightclub/scan", label: "Scan QR", icon: QrCode },
    { href: "/nightclub/events", label: "Evenements", icon: ShieldCheck },
    { href: "/nightclub/reservations", label: "Reservations", icon: Wine },
  ];
  const visibleShortcuts = useMemo(
    () =>
      shortcuts.filter((item) =>
        canAccessPath({
          pathname: item.href,
          user,
          activityId: activeContext.activityId,
          activityType: activeContext.activityType ?? ActivityType.BOITE_NUIT,
        }),
      ),
    [activeContext.activityId, activeContext.activityType, user],
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <article key={label} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_45%),linear-gradient(135deg,#0f172a,#111827,#1e293b)] p-5 text-white shadow-2xl shadow-slate-950/30">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">{label}</p>
              <Icon className="h-5 w-5 text-fuchsia-300" />
            </div>
            <p className="mt-6 font-display text-3xl">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-fuchsia-300">Tonight</p>
          <h1 className="mt-3 font-display text-4xl">Control Room Nightlife</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Pilotez les entrees, reservations VIP, ventes bouteilles et verifications de securite dans une interface nocturne premium.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {visibleShortcuts.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href as Route} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10">
                <Icon className="h-5 w-5 text-fuchsia-300" />
                <p className="mt-4 font-semibold">{label}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 text-white">
          <h2 className="font-display text-2xl">Activite recente</h2>
          <div className="mt-4 grid gap-3">
            {(data?.recentAccessLogs ?? []).map((item: any) => (
              <div key={item.id} className="rounded-2xl bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.client?.nom ?? "Client anonyme"}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.decision === "VALIDE" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                    {item.decision}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{item.reason ?? "Controle entree"}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
