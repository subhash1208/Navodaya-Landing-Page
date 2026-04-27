export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto py-10">
          <div className="h-3 w-32 bg-slate-100 rounded animate-pulse mb-4" />
          <div className="h-8 w-56 bg-slate-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="container mx-auto py-10">
        <div className="flex gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-slate-100 rounded-full animate-pulse" />
          ))}
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          aria-busy="true"
          aria-label="Loading products"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-2xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
