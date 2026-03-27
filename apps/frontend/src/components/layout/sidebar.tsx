 "use client";

import Link from "next/link";
import type { Route } from "next";
import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { getNavigationForActivity } from "@/lib/activity-routing";
import { canAccessUsersPage } from "@/lib/permissions";
import { useAppStore } from "@/store/app-store";

export function Sidebar() {
  const pathname = usePathname();
  const activityType = useAppStore((state) => state.activeContext.activityType);
  const activityId = useAppStore((state) => state.activeContext.activityId);
  const user = useAppStore((state) => state.user);
  const items = getNavigationForActivity(activityType, user, activityId);
  const canSeeUsers = canAccessUsersPage(user, activityId);

  return (
    <aside className="surface flex h-full flex-col gap-4 p-4">
      <div className="rounded-3xl bg-ink p-5 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">D_Show</p>
        <h1 className="mt-3 font-display text-3xl">Control Room</h1>
        <p className="mt-2 text-sm text-white/70">Pilotage centralise du complexe commercial.</p>
      </div>
      <nav className="grid gap-2">
        {items.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || (href !== "/restaurant" && pathname.startsWith(`${href}/`));
          return (
          <Link
            key={label}
            href={href as Route}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              active ? "bg-pine text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )})}
        {canSeeUsers ? (
          <Link
            href={"/users" as Route}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              pathname === "/users" ? "bg-pine text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Utilisateurs
          </Link>
        ) : null}
      </nav>
    </aside>
  );
}
