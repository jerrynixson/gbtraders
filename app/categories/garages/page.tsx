"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Filter, Grid, List, Clock, Phone, Globe, Mail, Facebook, Twitter, Instagram, ChevronDown, ChevronUp, PoundSterling, Settings, Shield } from "lucide-react"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { GoogleMapComponent } from "@/components/ui/google-map"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import Image from "next/image"
import { 
  getAllPublicGarages
} from "@/lib/garage"
import { type Garage } from "@/lib/types/garage"
import { AVAILABLE_SERVICES } from "@/lib/types/garage"

export default function SearchGaragesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")
  const [selectedCategory, setSelectedCategory] = useState<string>("All Services")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedContent, setSelectedContent] = useState("Websites")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedDistance, setSelectedDistance] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [garages, setGarages] = useState<Garage[]>([])
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load garages on component mount
  useEffect(() => {
    const loadGarages = async () => {
      try {
        setLoading(true)
        const garagesData = await getAllPublicGarages()
        setGarages(garagesData)
        setFilteredGarages(garagesData)
      } catch (error) {
        console.error('Error loading garages:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGarages()
  }, [])

  // Debounce search term
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(debounceTimeout)
  }, [searchTerm])

  // Client-side filtering logic
  useEffect(() => {
    let filtered = [...garages]

    // Apply search term filter (from top search form) - using debounced version
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(garage => 
        garage.name.toLowerCase().includes(searchLower) ||
        garage.description.toLowerCase().includes(searchLower) ||
        garage.address.toLowerCase().includes(searchLower)
      )
    }

    // Apply service filter (from top search form)
    if (selectedService) {
      filtered = filtered.filter(garage =>
        garage.services.some(service => 
          service.toLowerCase().includes(selectedService.toLowerCase())
        )
      )
    }

    // Apply location filter (from top search form)
    if (locationFilter.trim()) {
      const locationLower = locationFilter.toLowerCase()
      filtered = filtered.filter(garage =>
        garage.address.toLowerCase().includes(locationLower)
      )
    }

    // Apply category filter (from sidebar)
    if (selectedCategory !== "All Services") {
      filtered = filtered.filter(garage => 
        garage.services.some(service => 
          service.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      )
    }

    // Apply services filter (from sidebar checkboxes)
    if (selectedServices.length > 0) {
      filtered = filtered.filter(garage =>
        selectedServices.some(selectedService => 
          garage.services.some(garageService => 
            garageService.toLowerCase().includes(selectedService.toLowerCase())
          )
        )
      )
    }

    // Apply sorting
    filtered = applySorting(filtered, sortBy)

    setFilteredGarages(filtered)
  }, [garages, debouncedSearchTerm, selectedService, locationFilter, selectedCategory, selectedServices, sortBy])

  // Sorting logic
  const applySorting = (garageList: Garage[], sortOption: string) => {
    const sorted = [...garageList]
    
    switch (sortOption) {
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case 'distance':
        // For now, sort by name since we don't have distance calculation
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'reviews':
        // Sort by rating as proxy for reviews
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      default:
        return sorted
    }
  }

  // Remove old search effects - now using client-side filtering above

  // Handle search form submission - now just triggers client-side filtering
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    // Client-side filtering will automatically apply via useEffect dependencies
    // No need for server calls since all filtering is now client-side
  }

  // Use AVAILABLE_SERVICES from the imported types
  const allServices = AVAILABLE_SERVICES

  // Dynamic categories based on available garages
  const categories = [
    { name: "All Services", count: garages.length },
    { name: "MOT", count: garages.filter(g => g.services.includes("MOT")).length },
    { name: "Electric issue repair", count: garages.filter(g => g.services.includes("Electric issue repair")).length },
    { name: "Programming", count: garages.filter(g => g.services.includes("Programming")).length },
    { name: "Vehicle diagnostics", count: garages.filter(g => g.services.includes("Vehicle diagnostics")).length },
    { name: "Brakes and Clutches", count: garages.filter(g => g.services.includes("Brakes and Clutches")).length },
    { name: "Body Repair", count: garages.filter(g => g.services.includes("Body Repair")).length },
    { name: "Air conditioning", count: garages.filter(g => g.services.includes("Air conditioning")).length }
  ]

  const contentTypes = [
    "Websites", "Photos", "Reviews", "Videos", "Messaging"
  ]

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const clearFilters = () => {
    // Reset all filter states
    setSelectedCategory("All Services")
    setSelectedServices([])
    setSelectedContent("Websites")
    setSelectedDistance("all")
    setSelectedRating("all")
    setSearchQuery("")
    setSearchTerm('')
    setSelectedService('')
    setLocationFilter('')
  setSortBy("name")
  }

  // Pagination logic: show only first 9 garages per page
  const garagesToShow = filteredGarages.slice(0, 9)

  const GarageCard = ({ garage }: { garage: Garage }) => (
    <Link href={`/categories/garages/${garage.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
        <div className="relative">
          <Image 
            src={garage.image || '/placeholder.jpg'} 
            alt={garage.name} 
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-medium">
            {garage.price || 'Contact for pricing'}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {garage.name}
            </h3>
            {/** Rating UI disabled
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{garage.rating ? garage.rating.toFixed(1) : '0.0'}</span>
            </div>
            */}
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{garage.address}</span>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {garage.description}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {garage.services.slice(0, 3).map((service: string, i: number) => (
              <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                {service}
              </span>
            ))}
            {garage.services.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                +{garage.services.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {garage.openingHours?.weekdays?.start && garage.openingHours?.weekdays?.end 
                ? `${garage.openingHours.weekdays.start} - ${garage.openingHours.weekdays.end}` 
                : 'See hours'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header placeholder */}
      <div className="flex justify-center items-center py-4 mb-2">
        <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-none md:rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-blue-200 relative">
          <div className="hidden md:block md:w-2 md:h-full bg-gradient-to-b from-blue-400 to-blue-700 md:rounded-l-3xl md:rounded-t-none"></div>
          <form className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 p-4" onSubmit={handleSearch}>
            {/* Garage Name Field */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="garage-name" className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Garage Name</label>
              <Input
                id="garage-name"
                placeholder="Search garages..."
                className="w-full h-12 rounded-full bg-white/80 border border-blue-200 px-4 text-base"
                type="text"
                autoComplete="off"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Service Dropdown */}
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="service-filter" className="block text-xs font-semibold text-gray-700 mb-1 ml-1">What do you need?</label>
              <select
                id="service-filter"
                className="w-full pl-4 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 h-12"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">All Services</option>
                {allServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            {/* Location Field */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="location" className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Location</label>
              <Input
                id="location"
                placeholder="City or postcode"
                className="w-full h-12 rounded-full bg-white/80 border border-blue-200 px-4 text-base"
                type="text"
                autoComplete="off"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
            {/* Search Button */}
            <Button
              type="submit"
              className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-8 h-12 shadow-lg hover:scale-105 transition-transform duration-200 w-full md:w-auto"
              disabled={loading}
            >
              <Search className="mr-2 h-5 w-5" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </div>
      </div>

      {/* Feature Bar - moved to right column above dealer cards */}
      {/* Removed from here */}

      {/* Main Content */}
      <div className="container mx-auto px-2 sm:px-4 py-4">
        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="mb-2 flex justify-end">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => setShowMobileFilters(v => !v)}>
              <Filter className="h-5 w-5" />
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        )}
        
        {/* Garage Listings Container */}
        <div className="sticky top-0 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - show above results on mobile, left on desktop */}
          <div className={`lg:w-1/4 ${isMobile ? (showMobileFilters ? "block" : "hidden") : "block"}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-4 flex flex-col">
              {/* Map Preview - Glassmorphic Card */}
              <div className="mb-6">
                <div className="w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                  <GoogleMapComponent 
                    center={{ lat: 52.4862, lng: -1.8904 }}
                    zoom={13}
                  />
                </div>
              </div>

              {/* Filter header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Clear all
                </Button>
              </div>

              {/* Category Filter */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category-select"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Services Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Services
                  </label>
                  <div className="space-y-2">
                    {allServices.map(service => (
                      <label 
                        key={service} 
                        className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => toggleService(service)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Content Type Filter - Checkbox group */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Content Type
                  </label>
                  <div className="flex flex-col gap-2">
                    {contentTypes.map(content => (
                      <label key={content} className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedContent === content}
                          onChange={() => setSelectedContent(content)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{content}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Results */}
          <div className="lg:w-3/4 w-full">
            {/* Feature Bar - now above results header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 px-2 sm:px-4 py-4 sm:py-6 bg-white/70 backdrop-blur rounded-2xl shadow mb-6">
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
                <div>
                  <div className="font-bold text-gray-900">Up to 47% cheaper</div>
                  <div className="text-xs text-gray-500">Versus franchise garages</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <div className="font-bold text-gray-900">Vetted mechanics</div>
                  <div className="text-xs text-gray-500">Only qualified professionals</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <div className="font-bold text-gray-900">Quality guarantee</div>
                  <div className="text-xs text-gray-500">12-month warranty on parts</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <div className="font-bold text-gray-900">Same day service</div>
                  <div className="text-xs text-gray-500">Quick turnaround time</div>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3 md:gap-4">
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 w-full">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredGarages.length}</span> of <span className="font-semibold">{garages.length}</span> garages
                </p>
                <div className="flex items-center space-x-2 mt-2 xs:mt-0">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${
                      viewMode === "grid" 
                        ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" 
                        : ""
                    }`}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${
                      viewMode === "list" 
                        ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" 
                        : ""
                    }`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                <span className="text-sm font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-50 min-w-[120px]"
                >
                  {/* Rating-based sort removed */}
                  <option value="distance">Nearest</option>
                  <option value="name">Name A-Z</option>
                  {/* <option value="reviews">Most reviews</option> */}
                </select>
              </div>
            </div>

            {/* Garage listings */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading garages...</p>
                </div>
              </div>
            ) : filteredGarages.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No garages found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {garagesToShow.map((garage: Garage) => (
                  <GarageCard key={garage.id} garage={garage} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {garagesToShow.map((garage: Garage) => (
                  <div key={garage.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                    {/* ...existing code for list view card... */}
                    <div className="flex">
                      <div className="w-64 h-48 flex-shrink-0 relative">
                        <img src={garage.image || '/placeholder.jpg'} alt={garage.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-medium">
                          {garage.price || 'Contact for pricing'}
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                              {garage.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{garage.address}</span>
                            </div>
                          </div>
                          {/** Rating UI disabled
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{garage.rating ? garage.rating.toFixed(1) : '0.0'}</span>
                          </div>
                          */}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {garage.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {garage.services.slice(0, 5).map((service: string, i: number) => (
                            <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                              {service}
                            </span>
                          ))}
                          {garage.services.length > 5 && (
                            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                              +{garage.services.length - 5} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                          {garage.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{garage.phone}</span>
                            </div>
                          )}
                          {garage.openingHours && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Open today</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Open until {garage.openingHours.weekdays.end}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{garage.phone}</span>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-wrap justify-center mt-8 gap-2">
              <Button variant="outline" className="px-4 hover:bg-blue-50">Previous</Button>
              <Button variant="outline" className="px-4 bg-blue-600 text-white hover:bg-blue-700">1</Button>
              <Button variant="outline" className="px-4 hover:bg-blue-50">2</Button>
              <Button variant="outline" className="px-4 hover:bg-blue-50">3</Button>
              <Button variant="outline" className="px-4 hover:bg-blue-50">Next</Button>
            </div>
          </div>
        </div>

        {/* Additional Content Container */}
        <div className="relative">
          {/* Need Advice Section (commented out) */}
          {/*
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold mb-4">NEED ADVICE</h2>
            <h3 className="text-2xl font-semibold mb-6">Not sure what's wrong?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our in-house mechanics team is here to assist. Share a brief description of the problem and they can help get it fixed.
            </p>
            <Button className="bg-blue-500 text-white hover:bg-blue-600 font-semibold px-8 py-3 rounded-full mb-8">
              GET TECHNICAL ASSISTANCE →
            </Button>

            <h3 className="text-2xl font-semibold mb-6">Book a mechanic online today</h3>
            <p className="text-gray-600 mb-8">
              Get an instant quote, then book a vetted mechanic to fix your car at your home or office.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="flex flex-col items-center">
                <MapPin className="h-12 w-12 text-blue-600 mb-2" />
                <div className="text-sm font-medium">Maximum convenience</div>
                <div className="text-xs text-gray-500">See the garage before you come to you</div>
              </div>
              <div className="flex flex-col items-center">
                <PoundSterling className="h-12 w-12 text-blue-600 mb-2" />
                <div className="text-sm font-medium">No hidden costs</div>
                <div className="text-xs text-gray-500">All quotes include parts, labour and VAT</div>
              </div>
              <div className="flex flex-col items-center">
                <Settings className="h-12 w-12 text-blue-600 mb-2" />
                <div className="text-sm font-medium">Mechanics you can trust</div>
                <div className="text-xs text-gray-500">Friendly local experts</div>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="h-12 w-12 text-blue-600 mb-2" />
                <div className="text-sm font-medium">Spread the cost</div>
                <div className="text-xs text-gray-500">With finance!</div>
              </div>
            </div>

            <Button className="bg-orange-500 text-white hover:bg-orange-600 font-semibold px-8 py-3 rounded-lg mb-12">
              Get a quote →
            </Button>
          </div>
          */}

            {/* Service Cards Section (disabled) */}
            {false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 mb-12">
                {/* Brake Service Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                  <div className="relative">
                    <div className="absolute top-6 left-6 bg-blue-600 text-white rounded-full px-5 py-4 flex flex-col items-center shadow-lg">
                      <span className="text-2xl font-extrabold">£10</span>
                      <span className="block text-base font-medium">OFF</span>
                      <span className="text-sm tracking-wide">BRAKES</span>
                    </div>
                    <img src="/garages/breakpad.jpg" alt="Brake service" className="w-full h-56 object-cover object-center rounded-t-2xl" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between p-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Brake pads and discs replacement</h3>
                    <p className="text-lg text-gray-600 mb-6">From <span className="font-semibold text-blue-700">£139.99</span></p>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-base py-3 rounded-xl shadow-md transition-transform duration-200 hover:scale-105">
                      Get a quote →
                    </Button>
                  </div>
                </div>

                {/* Battery Service Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                  <div className="relative">
                    <img src="/garages/carbattery.jpg" alt="Battery service" className="w-full h-56 object-cover object-center rounded-t-2xl" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between p-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Car battery replacement</h3>
                    <p className="text-lg text-gray-600 mb-6">From <span className="font-semibold text-blue-700">£140</span></p>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-base py-3 rounded-xl shadow-md transition-transform duration-200 hover:scale-105">
                      Get a quote →
                    </Button>
                  </div>
                </div>

                {/* Diagnostic Service Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80" alt="Diagnostic service" className="w-full h-56 object-cover object-center rounded-t-2xl" />
                  </div>
                    <div className="flex-1 flex flex-col justify-between p-8">
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">Vehicle diagnostic check</h3>
                      <p className="text-lg text-gray-600 mb-6"><span className="font-semibold text-blue-700">£99</span></p>
                      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-base py-3 rounded-xl shadow-md transition-transform duration-200 hover:scale-105">
                        Get a quote →
                      </Button>
                    </div>
                </div>
                {/* Sample Service Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
                  <div className="relative">
                    <img src="/garages/aircondition.jpg" alt="Air Conditioning Service" className="w-full h-56 object-cover object-center rounded-t-2xl" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between p-8">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">Air Conditioning Service</h3>
                    <p className="text-lg text-gray-600 mb-6">From <span className="font-semibold text-blue-700">£89.99</span></p>
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold text-base py-3 rounded-xl shadow-md transition-transform duration-200 hover:scale-105">
                      Get a quote →
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Apply to be a mechanic Section (commented out) */}
            {/**
            <div className="flex flex-col md:flex-row items-center gap-8 mt-12 mb-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-extrabold mb-6 text-gray-900">Apply to be a mechanic</h2>
                <p className="text-lg text-gray-700 mb-8">Join GBTraders as a mechanic or garage and accept the work you want. Free to join, with great perks and discounts.</p>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-lg px-10 py-4 rounded-full shadow-lg transition-transform duration-200 hover:scale-105">
                  Work with GBTraders
                </Button>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="/garages/car-mechanic-changing-wheels-car.jpg" 
                  alt="Mechanic at work" 
                  className="w-full h-96 object-cover object-top rounded-xl border border-gray-200 shadow-lg bg-gray-100" 
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              </div>
            </div>
            */}

            {/* Bottom CTA Section (commented out) */}
            {/**
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Are you a garage owner?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">Join our network of trusted mechanics and grow your business. Get access to new customers and manage your bookings easily.</p>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3">
                Join as a Garage Partner
              </Button>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}