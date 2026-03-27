"use client";

export function VipBoard({ data }: { data: any }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950 p-6 text-white">
        <h2 className="font-display text-3xl">Clients VIP</h2>
        <div className="mt-4 grid gap-3">
          {(data?.vipClients ?? []).map((client: any) => (
            <div key={client.id} className="rounded-3xl bg-white/5 px-4 py-3">
              <p className="font-semibold">{client.nom} {client.prenom ?? ""}</p>
              <p className="text-sm text-slate-400">{client.telephone ?? client.email ?? "Contact non renseigne"}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6">
        <article className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-6 text-white">
          <h3 className="font-display text-2xl">Liste noire</h3>
          <div className="mt-4 grid gap-3">
            {(data?.blacklistedClients ?? []).map((client: any) => (
              <div key={client.id} className="rounded-3xl bg-black/15 px-4 py-3">
                <p className="font-semibold">{client.nom} {client.prenom ?? ""}</p>
                <p className="text-sm text-rose-100/80">{client.note ?? "Acces refuse"}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-900 p-6 text-white">
          <h3 className="font-display text-2xl">Derniers controles</h3>
          <div className="mt-4 grid gap-3">
            {(data?.recentAccessLogs ?? []).map((item: any) => (
              <div key={item.id} className="rounded-3xl bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.client?.nom ?? "Client anonyme"}</p>
                  <span className={`rounded-full px-3 py-1 text-xs ${item.decision === "VALIDE" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>{item.decision}</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{item.reason}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
