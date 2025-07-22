"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Car, PoundSterling, Clock, Gauge, Tag, Shield, Star, ChevronRight, RotateCcw } from "lucide-react"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VehicleType, VehicleFilters, FuelType, TransmissionType, CarBodyStyle } from '@/types/vehicles'
import { debounce } from '@/lib/utils'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters)

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Create memoized debounced functions to prevent recreation on every render
  const debouncedFilterChange = useCallback(
    debounce((newFilters: VehicleFilters) => {
      onFilterChange(newFilters)
    }, 500),
    [onFilterChange]
  )

  // Separate debounce for price and year inputs with 500ms delay
  const debouncedInputFilterChange = useCallback(
    debounce((newFilters: VehicleFilters) => {
      onFilterChange(newFilters)
    }, 500),
    [onFilterChange]
  )

  const updateFilters = useCallback((updates: Partial<VehicleFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    debouncedFilterChange(newFilters)
  }, [filters, debouncedFilterChange])

  const updateInputFilters = useCallback((updates: Partial<VehicleFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    // Only debounce the parent notification, not the local state update
    debouncedInputFilterChange(newFilters)
  }, [filters, debouncedInputFilterChange])

  const handleReset = () => {
    // Create a clean filter state with only the vehicle type
    const resetFilters: VehicleFilters = {
      type: selectedVehicleType,
      make: undefined,
      model: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minYear: undefined,
      maxYear: undefined,
      minMileage: undefined,
      maxMileage: undefined,
      fuelType: undefined,
      transmission: undefined,
      bodyStyle: undefined
    }
    
    // Update local state immediately
    setFilters(resetFilters)
    
    // Notify parent component
    onFilterChange(resetFilters)
    
    // Navigate to clean search page with vehicle type preserved
    const typeParam = selectedVehicleType ? `?type=${encodeURIComponent(selectedVehicleType)}` : ''
    router.push(`/search${typeParam}`)
  }

  const commonFeatures = ["Wheelchair Access", "Left Hand Drive", "Sat Nav", "Bluetooth", "Leather Seats"]
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"]
  const transmissions = ["Manual", "Automatic"]
  const colors = ["Black", "White", "Silver", "Blue", "Red", "Green", "Grey", "Other"]
  const safetyRatings = ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"]
  const vehicleHistories = ["Full Service History", "Part Service History", "No Service History"]
  const vehicleUsages = ["Private", "Business", "Taxi", "Other"]
  const dealerRatings = ["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"]

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

        {/* Vehicle Type */}
        <section className="border-t border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-sm text-gray-900">Vehicle Type</h3>
          </div>
          <Select
            value={filters.type || selectedVehicleType}
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
        </section>

        {/* Make & Model */}
        <section className="border-t border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Car className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-sm text-gray-900">Make & Model</h3>
          </div>
          <div className="space-y-2">
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
        </section>

        {/* Price Range */}
        <section className="border-t border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <PoundSterling className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-sm text-gray-900">Price Range</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => updateInputFilters({ minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => updateInputFilters({ maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </section>

        {/* Year Range */}
        <section className="border-t border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-sm text-gray-900">Year Range</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minYear || ''}
              onChange={(e) => updateInputFilters({ minYear: e.target.value ? parseInt(e.target.value) : undefined })}
              className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxYear || ''}
              onChange={(e) => updateInputFilters({ maxYear: e.target.value ? parseInt(e.target.value) : undefined })}
              className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </section>

        {/* Vehicle Attributes */}
        <section className="border-t border-gray-100 py-3">
          <div className="flex items-center mb-2">
            <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
              <Gauge className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-medium text-sm text-gray-900">Vehicle Attributes</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1">Mileage</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minMileage || ''}
                  onChange={(e) => updateInputFilters({ minMileage: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxMileage || ''}
                  onChange={(e) => updateInputFilters({ maxMileage: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1">Fuel Type</Label>
              <div className="grid grid-cols-2 gap-1">
                {fuelTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <Checkbox
                      id={`fuel-${type}`}
                      checked={filters.fuelType?.includes(type.toLowerCase() as FuelType)}
                      onCheckedChange={(checked) => {
                        const newFuelTypes = checked
                          ? [...(filters.fuelType || []), type.toLowerCase() as FuelType]
                          : (filters.fuelType || []).filter(f => f !== type.toLowerCase())
                        // Set to undefined if array is empty, otherwise set the array
                        updateFilters({ fuelType: newFuelTypes.length > 0 ? newFuelTypes : undefined })
                      }}
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                    />
                    <label htmlFor={`fuel-${type}`} className="text-xs ml-1.5 text-gray-700">{type}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-700 mb-1">Transmission</Label>
              <div className="grid grid-cols-2 gap-1">
                {transmissions.map((type) => (
                  <div key={type} className="flex items-center">
                    <Checkbox
                      id={`transmission-${type}`}
                      checked={filters.transmission?.includes(type.toLowerCase() as TransmissionType)}
                      onCheckedChange={(checked) => {
                        const newTransmissions = checked
                          ? [...(filters.transmission || []), type.toLowerCase() as TransmissionType]
                          : (filters.transmission || []).filter(t => t !== type.toLowerCase())
                        // Set to undefined if array is empty, otherwise set the array
                        updateFilters({ transmission: newTransmissions.length > 0 ? newTransmissions : undefined })
                      }}
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 h-4 w-4"
                    />
                    <label htmlFor={`transmission-${type}`} className="text-xs ml-1.5 text-gray-700">{type}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Body Type (only for cars) */}
        {selectedVehicleType === 'car' && (
          <section className="border-t border-gray-100 py-3">
            <div className="flex items-center mb-2">
              <div className="bg-blue-50 p-1.5 rounded mr-2" aria-hidden="true">
                <Car className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-medium text-sm text-gray-900">Body Type</h3>
            </div>
            <Select
              value={filters.bodyStyle?.[0] || ''}
              onValueChange={(value: CarBodyStyle) => updateFilters({ bodyStyle: value ? [value] : undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select body type" />
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
          </section>
        )}
      </div>
    </aside>
  )
}

