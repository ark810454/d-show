"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Inbox, LoaderCircle, TriangleAlert } from "lucide-react";

export function InlineFeedback({
  tone,
  children,
}: {
  tone: "error" | "success" | "info" | "warning";
  children: ReactNode;
}) {
  const map = {
    error: {
      wrap: "rounded-3xl bg-rose-50 px-5 py-4 text-sm text-rose-600",
      icon: AlertCircle,
    },
    success: {
      wrap: "rounded-3xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700",
      icon: CheckCircle2,
    },
    info: {
      wrap: "rounded-3xl bg-sky-50 px-5 py-4 text-sm text-sky-700",
      icon: LoaderCircle,
    },
    warning: {
      wrap: "rounded-3xl bg-amber-50 px-5 py-4 text-sm text-amber-700",
      icon: TriangleAlert,
    },
  } as const;

  const Icon = map[tone].icon;

  return (
    <div className={map[tone].wrap}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface grid gap-3 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

export function SectionSkeleton({
  lines = 3,
  cards = 0,
}: {
  lines?: number;
  cards?: number;
}) {
  return (
    <div className="surface grid gap-4 p-6">
      <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
      <div className="grid gap-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded-full bg-slate-100" />
        ))}
      </div>
      {cards ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: cards }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : null}
    </div>
  );
}
