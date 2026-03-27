"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  title: string;
  description: string;
  children: ReactNode;
}

export function Modal({ open, title, description, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <div className={cn("surface w-full max-w-lg p-6")}>
        <div className="mb-4">
          <h3 className="font-display text-2xl text-ink">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

