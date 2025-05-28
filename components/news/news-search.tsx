import { Search } from "lucide-react"

export function NewsSearch() {
  return (
    <div className="mb-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="make" className="block text-sm font-medium mb-1">
              Make
            </label>
            <div className="relative">
              <select
                id="make"
                className="w-full p-2 border border-border rounded-md appearance-none pr-10 bg-background"
              >
                <option value="">Any</option>
                <option value="audi">Audi</option>
                <option value="bmw">BMW</option>
                <option value="ford">Ford</option>
                <option value="mercedes">Mercedes-Benz</option>
                <option value="toyota">Toyota</option>
                <option value="volkswagen">Volkswagen</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium mb-1">
              Model
            </label>
            <div className="relative">
              <select
                id="model"
                className="w-full p-2 border border-border rounded-md appearance-none pr-10 bg-background"
              >
                <option value="">Any</option>
                <option value="a3">A3</option>
                <option value="a4">A4</option>
                <option value="3-series">3 Series</option>
                <option value="5-series">5 Series</option>
                <option value="focus">Focus</option>
                <option value="fiesta">Fiesta</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-full flex items-center justify-center">
          <Search className="w-4 h-4 mr-2" />
          Search 3,522 articles
        </button>
      </div>
    </div>
  )
}

