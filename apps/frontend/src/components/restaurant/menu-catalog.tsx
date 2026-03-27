"use client";

import type { KeyboardEvent } from "react";

export function MenuCatalog({
  categories,
  onSelectItem,
  onEditItem,
}: {
  categories: Array<any>;
  onSelectItem?: (item: any) => void;
  onEditItem?: (item: any) => void;
}) {
  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>, item: any) {
    if (!onSelectItem) {
      return;
    }

    if (event.key === "Endddter" || event.key === " ") {
      event.preventDefault();
      onSelectItem(item);
    }
  }

  return (
    <div className="grid gap-6">
      {categories.map((category) => (
        <section key={category.id}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-3xl text-ink">{category.nom}</h3>
              <p className="mt-1 text-sm text-slate-500">{category.description ?? "Selection tactile rapide"}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {category.items.map((item: any) => (
              <article
                key={item.id}
                role={onSelectItem ? "button" : undefined}
                tabIndex={onSelectItem ? 0 : undefined}
                onClick={() => onSelectItem?.(item)}
                onKeyDown={(event) => handleCardKeyDown(event, item)}
                className="surface group overflow-hidden p-0 text-left transition hover:-translate-y-1"
              >
                <div className="h-32 bg-gradient-to-br from-pine/20 via-gold/10 to-sand" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-slate-800">{item.nom}</h4>
                    <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                      {Number(item.prix).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{item.description ?? "Article disponible au service."}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.statut}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditItem?.(item);
                      }}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-pine hover:text-pine"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
