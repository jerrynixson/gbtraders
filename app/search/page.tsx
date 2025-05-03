"use client"

import { useState, useMemo, useCallback } from "react"
import { FilterSidebar } from "@/components/search/filter-sidebar"
import { SearchHeader } from "@/components/search/search-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Car, 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  MessageSquare, 
  Tag, 
  Shield, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List,
  Search
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { VehicleCard } from "@/components/vehicle-card"
import { vehicles } from "@/data/vehicles"

// Types
type ViewMode = "grid" | "list"
type SortOption = "distance" | "price_low" | "price_high" | "newest" | "oldest"

interface Vehicle {
  id: number
  image: string
  title: string
  price: number
  monthlyPrice: number
  year: string
  mileage: string
  distance: string
  location: string
  fuel: string
  transmission: string
  isHighlighted: boolean
}

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

// Constants
const ITEMS_PER_PAGE = 10

export default function VehicleShopPage() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortOption>("distance")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  // Memoized values
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle: Vehicle) => {
      // Apply search query filter
      const matchesSearch = 
        vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Apply filters
      const matchesFilters = 
        (!filters.make || vehicle.title.toLowerCase().includes(filters.make.toLowerCase())) &&
        (!filters.minPrice || vehicle.price >= parseInt(filters.minPrice)) &&
        (!filters.maxPrice || vehicle.price <= parseInt(filters.maxPrice)) &&
        (!filters.minYear || parseInt(vehicle.year) >= parseInt(filters.minYear)) &&
        (!filters.maxYear || parseInt(vehicle.year) <= parseInt(filters.maxYear)) &&
        (!filters.minMileage || parseInt(vehicle.mileage) >= parseInt(filters.minMileage)) &&
        (!filters.maxMileage || parseInt(vehicle.mileage) <= parseInt(filters.maxMileage)) &&
        (filters.fuelType.length === 0 || filters.fuelType.includes(vehicle.fuel)) &&
        (filters.transmission.length === 0 || filters.transmission.includes(vehicle.transmission))

      return matchesSearch && matchesFilters
    })
  }, [searchQuery, filters])

  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      switch (sortBy) {
        case "price_low":
          return a.price - b.price
        case "price_high":
          return b.price - a.price
        case "newest":
          return parseInt(b.year) - parseInt(a.year)
        case "oldest":
          return parseInt(a.year) - parseInt(b.year)
        case "distance":
        default:
          return parseFloat(a.distance) - parseFloat(b.distance)
      }
    })
  }, [filteredVehicles, sortBy])

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedVehicles, currentPage])

  const totalPages = useMemo(() => 
    Math.ceil(sortedVehicles.length / ITEMS_PER_PAGE)
  , [sortedVehicles])

  // Handlers
  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as SortOption)
    setCurrentPage(1) // Reset to first page when sorting changes
  }, [])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when search changes
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button 
            onClick={() => setError(null)}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 mb-6 lg:mb-0">
              <div className="sticky top-6">
                <FilterSidebar onFilterChange={setFilters} />
              </div>
            </aside>
            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* View and Sort controls */}
              <div className="sticky top-4 z-20 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* View toggle left */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "grid" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setViewMode("list")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "list" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
                {/* Centered search bar */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full pl-12 pr-4 py-2 rounded-full border border-gray-200 focus:ring-blue-500 focus:border-blue-500 text-base bg-white placeholder-gray-400 shadow-sm transition-all duration-200"
                      aria-label="Search vehicles"
                    />
                    <Search className="absolute left-4 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {/* Sort and results right */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="flex items-center">
                    <label htmlFor="sort" className="text-sm font-medium mr-3">Sort by:</label>
                    <select 
                      id="sort"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px]"
                      aria-label="Sort vehicles"
                    >
                      <option value="distance">Distance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-600 whitespace-nowrap">
                    {filteredVehicles.length.toLocaleString()} vehicles found
                  </div>
                </div>
              </div>
              {/* Vehicle listings */}
              <section className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-8"} transition-all`}> 
                {paginatedVehicles.map(vehicle => (
                  <VehicleCard 
                    key={vehicle.id}
                    id={vehicle.id}
                    image={vehicle.image}
                    title={vehicle.title}
                    price={vehicle.price}
                    monthlyPrice={vehicle.monthlyPrice}
                    year={vehicle.year}
                    mileage={vehicle.mileage}
                    distance={vehicle.distance}
                    location={vehicle.location}
                    fuel={vehicle.fuel}
                    transmission={vehicle.transmission}
                    isHighlighted={vehicle.isHighlighted}
                    view={viewMode}
                  />
                ))}
              </section>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
              {/* Trust badges */}
              <section className="bg-white p-8 my-10 border border-gray-200 rounded-2xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-100 group-hover:to-blue-200">
                      <Shield className="h-9 w-9 text-blue-800" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-800 transition-colors duration-200">Buyer Protection</h3>
                    <p className="text-sm text-gray-600 mt-2">All vehicles history checked</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-100 group-hover:to-blue-200">
                      <Car className="h-9 w-9 text-blue-800" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-800 transition-colors duration-200">Quality Assured</h3>
                    <p className="text-sm text-gray-600 mt-2">Inspected by certified technicians</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-100 group-hover:to-blue-200">
                      <CheckCircle className="h-9 w-9 text-blue-800" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-800 transition-colors duration-200">Satisfaction Guaranteed</h3>
                    <p className="text-sm text-gray-600 mt-2">14-day money back guarantee</p>
                  </div>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}