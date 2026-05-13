export function OfferCardSkeleton() {
  return (
    <div className="bg-white rounded-[var(--tm-r-lg)] border border-[var(--tm-ink-100)] shadow-[var(--tm-shadow-sm)] p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="skeleton w-3 h-3 rounded-full" />
          <div className="skeleton h-5 w-36 rounded" />
        </div>
        <div className="skeleton h-6 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="skeleton h-3 w-16 rounded mb-1.5" />
          <div className="skeleton h-7 w-28 rounded" />
        </div>
        <div>
          <div className="skeleton h-3 w-20 rounded mb-1.5" />
          <div className="skeleton h-7 w-24 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 py-3 border-y border-[var(--tm-ink-100)] mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="skeleton h-3 w-14 rounded mb-1.5" />
            <div className="skeleton h-5 w-12 rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-9 flex-1 rounded-full" />
        <div className="skeleton h-9 flex-1 rounded-full" />
      </div>
    </div>
  );
}
