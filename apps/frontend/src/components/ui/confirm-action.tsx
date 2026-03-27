"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ConfirmAction({
  title,
  description,
  confirmLabel,
  tone = "danger",
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "neutral";
  onConfirm: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Modal open={open} title={title} description={description}>
        <div className="flex justify-end gap-3">
          <Button type="button" className="bg-white text-slate-700 hover:bg-slate-100" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            className={tone === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-ink hover:bg-slate-800"}
            disabled={loading}
            onClick={() => void handleConfirm()}
          >
            {loading ? "Confirmation..." : confirmLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
}
