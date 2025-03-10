export function QuickInfoBar() {
  return (
    <div className="bg-accent py-3">
      <div className="container mx-auto flex flex-wrap justify-between px-4">
        <div className="flex items-center text-xs text-secondary mb-2 md:mb-0">
          <span className="mr-1">📍</span>
          <span>Free UK-Wide delivery</span>
        </div>
        <div className="flex items-center text-xs text-secondary mb-2 md:mb-0">
          <span className="mr-1">🔄</span>
          <span>14-day no-quibble</span>
        </div>
        <div className="flex items-center text-xs text-secondary mb-2 md:mb-0">
          <span className="mr-1">👍</span>
          <span>Fair pricing you can trust</span>
        </div>
        <div className="flex items-center text-xs text-secondary mb-2 md:mb-0">
          <span className="mr-1">✅</span>
          <span>All cars AA inspected</span>
        </div>
        <div className="flex items-center text-xs text-secondary">
          <span className="mr-1">📞</span>
          <span>0800 050 2333</span>
        </div>
      </div>
    </div>
  )
}

