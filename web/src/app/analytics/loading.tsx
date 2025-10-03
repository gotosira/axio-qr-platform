export default function Loading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-6 w-6 bg-muted rounded"></div>
              </div>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </div>
          ))}
        </div>

        {/* Charts section skeleton */}
        <div className="grid gap-6 mb-8 lg:grid-cols-2">
          <div className="bg-card rounded-xl border p-6">
            <div className="h-6 bg-muted rounded w-32 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="h-6 bg-muted rounded w-32 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>

        {/* QR performance table skeleton */}
        <div className="bg-card rounded-xl border p-6">
          <div className="h-6 bg-muted rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}