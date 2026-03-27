"use client";

import Link from "next/link";
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import { Settings2 } from "lucide-react";

type SettingsCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function ActivitySettingsHub({
  eyebrow,
  title,
  description,
  cards,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cards: SettingsCard[];
}) {
  return (
    <section className="grid gap-6">
      <div className="surface p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl text-ink">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title: cardTitle, description: cardDescription, href, icon: Icon }) => (
          <Link
            key={cardTitle}
            href={href as Route}
            className="surface p-6 transition hover:-translate-y-1 hover:border-pine/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl text-ink">{cardTitle}</h2>
            <p className="mt-3 text-sm text-slate-500">{cardDescription}</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              <Settings2 className="h-3.5 w-3.5" />
              Ouvrir
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
