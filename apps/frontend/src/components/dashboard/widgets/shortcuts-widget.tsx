import Link from "next/link";
import type { Route } from "next";
import type { DashboardOverview } from "@dshow/shared";
import { ArrowRight } from "lucide-react";
import { SummaryWidget } from "../summary-widget";

export function ShortcutsWidget({ shortcuts }: { shortcuts: DashboardOverview["shortcuts"] }) {
  return (
    <SummaryWidget title="Raccourcis" subtitle="Acces direct aux modules frequents">
      <div className="grid gap-3">
        {shortcuts.map((shortcut) => (
          <Link key={shortcut.label} href={shortcut.href as Route} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-pine/40 hover:bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{shortcut.label}</p>
                <p className="mt-1 text-sm text-slate-500">{shortcut.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-pine" />
            </div>
          </Link>
        ))}
      </div>
    </SummaryWidget>
  );
}
