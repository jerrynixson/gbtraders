"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Car, PoundSterling, Clock, Gauge, Tag, Shield, Star, ChevronRight, RotateCcw } from "lucide-react"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { VehicleType, VehicleFilters, FuelType, TransmissionType, CarBodyStyle } from '@/types/vehicles'
import { debounce } from '@/lib/utils'

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
  type: VehicleType
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

interface FilterSidebarProps {
  initialFilters: VehicleFilters
  onFilterChange: (filters: VehicleFilters) => void
  availableMakes: string[]
  availableModels: string[]
  selectedVehicleType: VehicleType
}

export function FilterSidebar({
  initialFilters,
  onFilterChange,
  availableMakes,
  availableModels,
  selectedVehicleType,
}: FilterSidebarProps) {
  // State for filters
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters)

  // Update filters when initialFilters change
  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Debounced filter change handler
  const debouncedFilterChange = debounce((newFilters: VehicleFilters) => {
    onFilterChange(newFilters)
  }, 500)

  // Update filters and notify parent
  const updateFilters = (updates: Partial<VehicleFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    debouncedFilterChange(newFilters)
  }

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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
      {/* Vehicle Type */}
      <div className="space-y-2">
        <Label>Vehicle Type</Label>
        <Select
          value={filters.type}
          onValueChange={(value: VehicleType) => updateFilters({ type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="used-car">Used Car</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="van">Van</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Make */}
      <div className="space-y-2">
        <Label>Make</Label>
        <Select
          value={filters.make?.[0] || ''}
          onValueChange={(value) => updateFilters({ make: value ? [value] : undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select make" />
          </SelectTrigger>
          <SelectContent>
            {availableMakes.map((make) => (
              <SelectItem key={make} value={make}>
                {make}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model (only show if make is selected) */}
      {filters.make && (
        <div className="space-y-2">
          <Label>Model</Label>
          <Select
            value={filters.model?.[0] || ''}
            onValueChange={(value) => updateFilters({ model: value ? [value] : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Price Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => updateFilters({ minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilters({ maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Year Range */}
      <div className="space-y-4">
        <Label>Year Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minYear || ''}
              onChange={(e) => updateFilters({ minYear: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxYear || ''}
              onChange={(e) => updateFilters({ maxYear: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Mileage Range */}
      <div className="space-y-4">
        <Label>Mileage Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minMileage || ''}
              onChange={(e) => updateFilters({ minMileage: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxMileage || ''}
              onChange={(e) => updateFilters({ maxMileage: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <Label>Fuel Type</Label>
        <Select
          value={filters.fuelType?.[0] || ''}
          onValueChange={(value: FuelType) => updateFilters({ fuelType: value ? [value] : undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select fuel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="petrol">Petrol</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="electric">Electric</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <Label>Transmission</Label>
        <Select
          value={filters.transmission?.[0] || ''}
          onValueChange={(value: TransmissionType) => updateFilters({ transmission: value ? [value] : undefined })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select transmission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
            <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Body Style (only for cars) */}
      {(filters.type === 'car' || filters.type === 'used-car') && (
        <div className="space-y-2">
          <Label>Body Style</Label>
          <Select
            value={filters.bodyStyle?.[0] || ''}
            onValueChange={(value: CarBodyStyle) => updateFilters({ bodyStyle: value ? [value] : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select body style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="hatchback">Hatchback</SelectItem>
              <SelectItem value="coupe">Coupe</SelectItem>
              <SelectItem value="convertible">Convertible</SelectItem>
              <SelectItem value="wagon">Wagon</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => updateFilters(initialFilters)}
      >
        Reset Filters
      </Button>
    </div>
  )
}

