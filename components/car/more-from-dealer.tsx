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
      <h2 className="text-xl font-semibold mb-4">More from the dealer</h2>
      <div className="grid grid-cols-1 gap-4">
        {cars.map((car, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="flex">
              <div className="w-1/3 h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-sm text-gray-500">Image not available</span>
              </div>
              <div className="w-2/3 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-2xl font-semibold text-primary">{car.price}</div>
                    <div className="text-sm text-gray-500">{car.term}</div>
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-2">{car.name}</h3>
                <p className="text-base text-gray-600 mb-4">{car.description}</p>
                
                <div className="flex gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {car.year}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {car.fuelType}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {car.transmission}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

