import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5",
        "bg-ink text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

