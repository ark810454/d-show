import { cn } from "@/lib/cn";

const statusClasses: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  INACTIVE: "bg-slate-100 text-slate-700",
  LIBRE: "bg-slate-100 text-slate-700",
  OCCUPEE: "bg-amber-100 text-amber-800",
  RESERVEE: "bg-sky-100 text-sky-800",
  PAYE: "bg-emerald-100 text-emerald-800",
  IMPAYE: "bg-rose-100 text-rose-800",
  PRET: "bg-violet-100 text-violet-800",
  ANNULE: "bg-slate-200 text-slate-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        statusClasses[status] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {status}
    </span>
  );
}
