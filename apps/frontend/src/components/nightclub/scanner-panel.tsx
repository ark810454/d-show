"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ScannerPanel({
  userId,
  onValidate,
}: {
  userId?: string;
  onValidate: (payload: any) => Promise<any>;
}) {
  const [qrCode, setQrCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-950 p-5 text-white">
        <h2 className="font-display text-3xl">Scan QR</h2>
        <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Coller ou scanner le QR code" className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" />
        <Button
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500"
          disabled={!qrCode}
          onClick={async () => {
            try {
              setError("");
              const response = await onValidate({ qrCode, validatedByUserId: userId });
              setResult(response);
            } catch (err: any) {
              setResult(null);
              setError(err?.response?.data?.message ?? "Validation impossible");
            }
          }}
        >
          Valider l'entree
        </Button>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-900 p-6 text-white">
        <h3 className="font-display text-3xl">Resultat</h3>
        {error ? (
          <div className="mt-5 rounded-3xl bg-rose-500/15 p-5 text-rose-200">{error}</div>
        ) : result ? (
          <div className="mt-5 grid gap-4">
            <div className={`rounded-3xl p-5 ${result.vip ? "bg-amber-500/15 text-amber-100" : "bg-emerald-500/15 text-emerald-100"}`}>
              <p className="text-sm uppercase tracking-[0.2em]">{result.vip ? "Acces prioritaire" : "Entree autorisee"}</p>
              <p className="mt-3 font-display text-3xl">{result.message}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-slate-400">{result.ticket.reference}</p>
              <p className="mt-2 text-lg font-semibold">{result.ticket.client?.nom ?? "Client anonyme"}</p>
              <p className="mt-1 text-sm text-slate-400">{result.ticket.event?.nom ?? "Acces libre"}</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-3xl bg-white/5 p-5 text-slate-400">En attente d'un scan.</div>
        )}
      </section>
    </div>
  );
}
