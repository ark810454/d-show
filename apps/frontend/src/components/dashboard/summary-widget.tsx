import type { ReactNode } from "react";

export function SummaryWidget({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="surface p-5">
      <div className="mb-4">
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

