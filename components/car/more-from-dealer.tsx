interface CarItem {
  price: string
  term: string
  name: string
  description: string
  fullPrice: string
  year: string
  fuelType: string
  transmission: string
}

interface MoreFromDealerProps {
  cars: CarItem[]
}

export function MoreFromDealer({ cars }: MoreFromDealerProps) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">More from the dealer</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cars.map((car, index) => (
          <div key={index} className="border border-border rounded-md overflow-hidden">
            <div className="h-24 bg-accent flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Image not available</span>
            </div>
            <div className="p-3">
              <div className="text-xs font-semibold mb-1">{car.price}</div>
              <div className="text-xs text-muted-foreground mb-2">{car.term}</div>
              <h3 className="text-sm font-semibold mb-1">{car.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{car.description}</p>
              <div className="text-xs text-muted-foreground">{car.fullPrice}</div>
              <div className="flex flex-wrap mt-2">
                <div className="flex items-center text-xs text-muted-foreground mr-3 mb-1">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {car.year}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mr-3 mb-1">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {car.fuelType}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mr-3 mb-1">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {car.transmission}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

