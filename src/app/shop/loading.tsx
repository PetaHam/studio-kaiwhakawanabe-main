export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header skeleton */}
        <div className="h-24 bg-slate-200 rounded-3xl" />
        
        {/* Tabs skeleton */}
        <div className="h-12 bg-slate-200 rounded-3xl" />
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
