import { cn } from "@/lib/cn";

const styles: Record<string, string> = {
  LIBRE: "bg-emerald-100 text-emerald-800",
  OCCUPEE: "bg-amber-100 text-amber-800",
  RESERVEE: "bg-sky-100 text-sky-800",
  EN_NETTOYAGE: "bg-violet-100 text-violet-800",
  EN_ATTENTE: "bg-slate-100 text-slate-700",
  EN_PREPARATION: "bg-amber-100 text-amber-800",
  PRET: "bg-emerald-100 text-emerald-800",
  SERVI: "bg-pine/10 text-pine",
  ANNULE: "bg-rose-100 text-rose-800",
  PAYE: "bg-emerald-100 text-emerald-800",
  PARTIEL: "bg-orange-100 text-orange-800",
  IMPAYE: "bg-rose-100 text-rose-800",
};

export function RestaurantStatusPill({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide", styles[value] ?? "bg-slate-100 text-slate-700")}>
      {value}
    </span>
  );
}

