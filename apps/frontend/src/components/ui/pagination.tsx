"use client";

import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>
        Page {page} sur {pageCount}
      </span>
      <div className="flex gap-2">
        <Button
          className="bg-white text-slate-700 hover:bg-slate-100"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Precedent
        </Button>
        <Button
          className="bg-white text-slate-700 hover:bg-slate-100"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
