export function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="surface h-28 animate-pulse bg-white/70" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface h-32 animate-pulse bg-white/70" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="surface h-96 animate-pulse bg-white/70" />
        <div className="surface h-96 animate-pulse bg-white/70" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface h-72 animate-pulse bg-white/70" />
        ))}
      </div>
    </div>
  );
}

