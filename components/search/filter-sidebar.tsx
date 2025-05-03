"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Car, PoundSterling, Clock, Gauge, Tag, Shield, Star, ChevronRight, RotateCcw } from "lucide-react"

// Types
interface FilterState {
  searchRadius: string
  make: string
  model: string
  trim: string
  bodyStyle: string
  minPrice: string
  maxPrice: string
  minYear: string
  maxYear: string
  minMileage: string
  maxMileage: string
  fuelType: string[]
  transmission: string[]
  doors: string[]
  seats: string[]
  color: string[]
  features: string[]
  safetyRating: string
  vehicleHistory: string
  vehicleUsage: string
  dealerRating: string
}

type ToggleButtonProps = {
  options: [string, string]
  activeIndex: number
  onChange: (index: number) => void
}

function ToggleButton({ options, activeIndex, onChange }: ToggleButtonProps) {
  return (
    <div className="flex rounded-full overflow-hidden border border-gray-300 w-full">
      {options.map((option, index) => (
        <button
          key={index}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeIndex === index ? "bg-blue-800 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onChange(index)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

type ExpandableSectionProps = {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
}

function ExpandableSection({ title, children, icon }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="py-3">
      <button className="flex items-center justify-between w-full text-left" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <span className="font-medium">{title}</span>
        </div>
        <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
      </button>

      {isExpanded && <div className="mt-3 pl-6">{children}</div>}
    </div>
  )
}

type FilterItemProps = {
  label: string
  count?: number
  onClick?: () => void
}

function FilterItem({ label, count, onClick }: FilterItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <ChevronRight className="h-4 w-4" />
    </div>
  )
}

export function FilterSidebar({ onFilterChange }: { onFilterChange: (filters: FilterState) => void }) {
  const [priceToggle, setPriceToggle] = useState(0)
  const [yearToggle, setYearToggle] = useState(0)
  const [keyword, setKeyword] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    searchRadius: "",
    make: "",
    model: "",
    trim: "",
    bodyStyle: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    minMileage: "",
    maxMileage: "",
    fuelType: [],
    transmission: [],
    doors: [],
    seats: [],
    color: [],
    features: [],
    safetyRating: "",
    vehicleHistory: "",
    vehicleUsage: "",
    dealerRating: ""
  })

  const commonFeatures = ["Wheelchair Access", "Left Hand Drive", "Sat Nav", "Bluetooth", "Leather Seats"]
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "LPG"]
  const transmissions = ["Manual", "Automatic", "Semi-Automatic"]
  const colors = ["Black", "White", "Silver", "Blue", "Red", "Green", "Grey", "Other"]
  const safetyRatings = ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"]
  const vehicleHistories = ["Full Service History", "Part Service History", "No Service History"]
  const vehicleUsages = ["Private", "Business", "Taxi", "Other"]
  const dealerRatings = ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"]

  // Add predefined options for makes, models, trims, and body types
  const makes = [
    "Audi", "BMW", "Ford", "Honda", "Hyundai", "Kia", "Land Rover", "Lexus",
    "Mercedes-Benz", "Nissan", "Porsche", "Renault", "Skoda", "Tesla", "Toyota",
    "Volkswagen", "Volvo"
  ]

  const models = {
    "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron"],
    "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "i3", "i4", "iX"],
    "Ford": ["Fiesta", "Focus", "Mondeo", "Kuga", "Puma", "Mustang", "Ranger", "Transit"],
    "Honda": ["Civic", "CR-V", "HR-V", "Jazz", "Accord"],
    "Hyundai": ["i10", "i20", "i30", "Tucson", "Santa Fe", "Kona", "IONIQ"],
    "Kia": ["Picanto", "Rio", "Ceed", "Sportage", "Sorento", "Niro", "EV6"],
    "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque"],
    "Lexus": ["UX", "NX", "RX", "ES", "LS"],
    "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "EQC"],
    "Nissan": ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Ariya"],
    "Porsche": ["911", "Taycan", "Macan", "Cayenne", "Panamera"],
    "Renault": ["Clio", "Captur", "Megane", "Kadjar", "Zoe"],
    "Skoda": ["Fabia", "Scala", "Octavia", "Karoq", "Kodiaq", "Enyaq"],
    "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
    "Toyota": ["Yaris", "Corolla", "RAV4", "C-HR", "Prius", "bZ4X"],
    "Volkswagen": ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "ID.3", "ID.4", "ID.5"],
    "Volvo": ["XC40", "XC60", "XC90", "S60", "S90", "V60", "V90", "C40"]
  }

  const trims = [
    "Standard", "SE", "SEL", "Sport", "GT", "R-Line", "M Sport", "AMG Line",
    "S Line", "RS", "M", "AMG", "Vorsprung", "Exclusive", "Luxury", "Premium"
  ]

  const bodyTypes = [
    "Hatchback", "Saloon", "Estate", "SUV", "MPV", "Coupe", "Convertible",
    "Pickup", "Van", "Sports Car", "Supercar", "Electric"
  ]

  const handleReset = () => {
    setFilters({
      searchRadius: "",
      make: "",
      model: "",
      trim: "",
      bodyStyle: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      minMileage: "",
      maxMileage: "",
      fuelType: [],
      transmission: [],
      doors: [],
      seats: [],
      color: [],
      features: [],
      safetyRating: "",
      vehicleHistory: "",
      vehicleUsage: "",
      dealerRating: ""
    })
    setKeyword("")
    setPriceToggle(0)
    setYearToggle(0)
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => {
      const newFeatures = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
      const newFilters = { ...prev, features: newFeatures }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  return (
    <aside 
      className="w-full max-w-xs border-r border-gray-200 bg-white shadow-sm"
      aria-label="Vehicle search filters"
    >
      <div className="p-4">
        {/* Header */}
        <header className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </header>

        {/* Reset Button */}
        <Button
          variant="outline"
          className="flex items-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full justify-center mb-3 text-sm"
          onClick={handleReset}
          aria-label="Reset all filters"
        >
          <RotateCcw className="h-3 w-3 mr-1" aria-hidden="true" />
          Reset All Filters
        </Button>

        {/* Search Radius */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="search-radius-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="search-radius-heading" className="font-medium text-sm text-gray-900">Search Radius</h3>
          </div>
          <Input 
            placeholder="Enter postcode (e.g. CR26EW)" 
            className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={filters.searchRadius}
            onChange={(e) => handleFilterChange("searchRadius", e.target.value)}
            aria-label="Search radius postcode"
          />
        </section>

        {/* Make, Model & Trim */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="make-model-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="make-model-heading" className="font-medium text-sm text-gray-900">Make, Model & Trim</h3>
          </div>

          <div className="space-y-2">
            <div>
              <label htmlFor="make-select" className="block text-xs font-medium text-gray-700 mb-0.5">Make</label>
              <select 
                id="make-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.make}
                onChange={(e) => {
                  handleFilterChange("make", e.target.value)
                  handleFilterChange("model", "")
                }}
                aria-label="Select vehicle make"
              >
                <option value="">Select Make</option>
                {makes.map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="model-select" className="block text-xs font-medium text-gray-700 mb-0.5">Model</label>
              <select 
                id="model-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                value={filters.model}
                onChange={(e) => handleFilterChange("model", e.target.value)}
                disabled={!filters.make}
                aria-label="Select vehicle model"
                aria-disabled={!filters.make}
              >
                <option value="">Select Model</option>
                {filters.make && models[filters.make as keyof typeof models]?.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="trim-select" className="block text-xs font-medium text-gray-700 mb-0.5">Trim</label>
              <select 
                id="trim-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.trim}
                onChange={(e) => handleFilterChange("trim", e.target.value)}
                aria-label="Select vehicle trim"
              >
                <option value="">Select Trim</option>
                {trims.map((trim) => (
                  <option key={trim} value={trim}>{trim}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="body-type-select" className="block text-xs font-medium text-gray-700 mb-0.5">Body Type</label>
              <select 
                id="body-type-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.bodyStyle}
                onChange={(e) => handleFilterChange("bodyStyle", e.target.value)}
                aria-label="Select vehicle body type"
              >
                <option value="">Select Body Type</option>
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Budget */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="budget-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <PoundSterling className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="budget-heading" className="font-medium text-sm text-gray-900">Budget</h3>
          </div>

          <div className="mb-2" role="radiogroup" aria-label="Price type">
            <ToggleButton options={["Price", "Monthly cost"]} activeIndex={priceToggle} onChange={setPriceToggle} />
          </div>

          <div className="space-y-2">
            <div>
              <label htmlFor="min-price-select" className="block text-xs font-medium text-gray-700 mb-0.5">Min Price</label>
              <select 
                id="min-price-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                aria-label="Select minimum price"
              >
                <option value="">No minimum</option>
                <option value="1000">£1,000</option>
                <option value="2000">£2,000</option>
                <option value="5000">£5,000</option>
                <option value="10000">£10,000</option>
              </select>
            </div>

            <div>
              <label htmlFor="max-price-select" className="block text-xs font-medium text-gray-700 mb-0.5">Max Price</label>
              <select 
                id="max-price-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                aria-label="Select maximum price"
              >
                <option value="">No maximum</option>
                <option value="5000">£5,000</option>
                <option value="10000">£10,000</option>
                <option value="20000">£20,000</option>
                <option value="50000">£50,000</option>
              </select>
            </div>
          </div>
        </section>

        {/* Year Or Age */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="year-age-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="year-age-heading" className="font-medium text-sm text-gray-900">Year Or Age</h3>
          </div>

          <div className="mb-2" role="radiogroup" aria-label="Year or age selection">
            <ToggleButton options={["Year", "Age"]} activeIndex={yearToggle} onChange={setYearToggle} />
          </div>

          <div className="space-y-2">
            <div>
              <label htmlFor="min-year-select" className="block text-xs font-medium text-gray-700 mb-0.5">Min Year</label>
              <select 
                id="min-year-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.minYear}
                onChange={(e) => handleFilterChange("minYear", e.target.value)}
                aria-label="Select minimum year"
              >
                <option value="">No minimum</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div>
              <label htmlFor="max-year-select" className="block text-xs font-medium text-gray-700 mb-0.5">Max Year</label>
              <select 
                id="max-year-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.maxYear}
                onChange={(e) => handleFilterChange("maxYear", e.target.value)}
                aria-label="Select maximum year"
              >
                <option value="">No maximum</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>
        </section>

        {/* Vehicle Attributes */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="attributes-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Gauge className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="attributes-heading" className="font-medium text-sm text-gray-900">Vehicle Attributes</h3>
          </div>

          <div className="space-y-2">
            <div>
              <label htmlFor="min-mileage" className="block text-xs font-medium text-gray-700 mb-0.5">Mileage</label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  id="min-mileage"
                  placeholder="Min" 
                  className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  value={filters.minMileage}
                  onChange={(e) => handleFilterChange("minMileage", e.target.value)}
                  aria-label="Minimum mileage"
                />
                <Input 
                  id="max-mileage"
                  placeholder="Max" 
                  className="w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  value={filters.maxMileage}
                  onChange={(e) => handleFilterChange("maxMileage", e.target.value)}
                  aria-label="Maximum mileage"
                />
              </div>
            </div>

            <fieldset>
              <legend className="block text-xs font-medium text-gray-700 mb-1">Fuel Type</legend>
              <div className="grid grid-cols-2 gap-1">
                {fuelTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <Checkbox 
                      id={`fuel-${type}`}
                      checked={filters.fuelType.includes(type)}
                      onCheckedChange={() => {
                        const newFuelTypes = filters.fuelType.includes(type)
                          ? filters.fuelType.filter(f => f !== type)
                          : [...filters.fuelType, type]
                        handleFilterChange("fuelType", newFuelTypes)
                      }}
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                      aria-label={`Select ${type} fuel type`}
                    />
                    <label htmlFor={`fuel-${type}`} className="text-xs ml-1.5 text-gray-700">{type}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-xs font-medium text-gray-700 mb-1">Transmission</legend>
              <div className="grid grid-cols-2 gap-1">
                {transmissions.map((type) => (
                  <div key={type} className="flex items-center">
                    <Checkbox 
                      id={`transmission-${type}`}
                      checked={filters.transmission.includes(type)}
                      onCheckedChange={() => {
                        const newTransmissions = filters.transmission.includes(type)
                          ? filters.transmission.filter(t => t !== type)
                          : [...filters.transmission, type]
                        handleFilterChange("transmission", newTransmissions)
                      }}
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                      aria-label={`Select ${type} transmission`}
                    />
                    <label htmlFor={`transmission-${type}`} className="text-xs ml-1.5 text-gray-700">{type}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-xs font-medium text-gray-700 mb-1">Color</legend>
              <div className="grid grid-cols-2 gap-1">
                {colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <Checkbox 
                      id={`color-${color}`}
                      checked={filters.color.includes(color)}
                      onCheckedChange={() => {
                        const newColors = filters.color.includes(color)
                          ? filters.color.filter(c => c !== color)
                          : [...filters.color, color]
                        handleFilterChange("color", newColors)
                      }}
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                      aria-label={`Select ${color} color`}
                    />
                    <label htmlFor={`color-${color}`} className="text-xs ml-1.5 text-gray-700">{color}</label>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        {/* Vehicle Features */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="features-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Tag className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="features-heading" className="font-medium text-sm text-gray-900">Vehicle Features</h3>
          </div>

          <div className="flex mb-2">
            <Input
              id="feature-keyword"
              placeholder="Enter keywords here..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 mr-2 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
              aria-label="Enter feature keyword"
            />
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 text-sm px-2"
              onClick={() => {
                if (keyword && !filters.features.includes(keyword)) {
                  handleFilterChange("features", [...filters.features, keyword])
                  setKeyword("")
                }
              }}
              aria-label="Add feature keyword"
            >
              Add
            </Button>
          </div>

          <p className="text-xs text-gray-500 mb-1">Common Keywords:</p>

          <fieldset>
            <legend className="sr-only">Common features</legend>
            <div className="grid grid-cols-2 gap-1">
              {commonFeatures.map((feature) => (
                <div key={feature} className="flex items-center">
                  <Checkbox 
                    id={`feature-${feature}`}
                    checked={filters.features.includes(feature)}
                    onCheckedChange={() => handleFeatureToggle(feature)}
                    className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                    aria-label={`Select ${feature} feature`}
                  />
                  <label htmlFor={`feature-${feature}`} className="text-xs ml-1.5 text-gray-700">{feature}</label>
                </div>
              ))}
            </div>
          </fieldset>
        </section>

        {/* Safety & History */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="safety-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="safety-heading" className="font-medium text-sm text-gray-900">Safety & History</h3>
          </div>

          <div className="space-y-2">
            <div>
              <label htmlFor="safety-rating-select" className="block text-xs font-medium text-gray-700 mb-0.5">Safety Rating</label>
              <select 
                id="safety-rating-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.safetyRating}
                onChange={(e) => handleFilterChange("safetyRating", e.target.value)}
                aria-label="Select safety rating"
              >
                <option value="">Any Rating</option>
                {safetyRatings.map((rating) => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vehicle-history-select" className="block text-xs font-medium text-gray-700 mb-0.5">Vehicle History</label>
              <select 
                id="vehicle-history-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.vehicleHistory}
                onChange={(e) => handleFilterChange("vehicleHistory", e.target.value)}
                aria-label="Select vehicle history"
              >
                <option value="">Any History</option>
                {vehicleHistories.map((history) => (
                  <option key={history} value={history}>{history}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vehicle-usage-select" className="block text-xs font-medium text-gray-700 mb-0.5">Vehicle Usage</label>
              <select 
                id="vehicle-usage-select"
                className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={filters.vehicleUsage}
                onChange={(e) => handleFilterChange("vehicleUsage", e.target.value)}
                aria-label="Select vehicle usage"
              >
                <option value="">Any Usage</option>
                {vehicleUsages.map((usage) => (
                  <option key={usage} value={usage}>{usage}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Advert Options */}
        <section 
          className="border-t border-gray-100 py-3"
          aria-labelledby="advert-heading"
        >
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Star className="h-4 w-4 text-blue-600" />
            </div>
            <h3 id="advert-heading" className="font-medium text-sm text-gray-900">Advert Options</h3>
          </div>

          <div>
            <label htmlFor="dealer-rating-select" className="block text-xs font-medium text-gray-700 mb-0.5">Dealer Rating</label>
            <select 
              id="dealer-rating-select"
              className="w-full border border-gray-200 rounded p-1.5 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={filters.dealerRating}
              onChange={(e) => handleFilterChange("dealerRating", e.target.value)}
              aria-label="Select dealer rating"
            >
              <option value="">Any Rating</option>
              {dealerRatings.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
          </div>
        </section>
      </div>
    </aside>
  )
}

