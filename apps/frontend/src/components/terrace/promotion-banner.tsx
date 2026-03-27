export function PromotionBanner({ promotions }: { promotions: any[] }) {
  if (!promotions.length) {
    return (
      <section className="surface p-5">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Happy hour</p>
        <h3 className="mt-2 font-display text-3xl text-ink">Aucune promotion en cours</h3>
      </section>
    );
  }

  return (
    <section className="surface bg-gradient-to-r from-gold/20 via-white to-pine/10 p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Promotions en cours</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {promotions.map((promotion) => (
          <div key={promotion.id} className="rounded-3xl bg-white px-4 py-3 shadow-soft">
            <p className="font-semibold text-slate-800">{promotion.nom}</p>
            <p className="text-sm text-slate-500">{promotion.reductionPct}% · {promotion.startTime} - {promotion.endTime}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

