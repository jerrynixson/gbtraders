"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Filter, Grid, List, Star, Clock, Phone, Globe, Mail, Facebook, Twitter, Instagram, ChevronDown, ChevronUp, PoundSterling, Settings, Shield } from "lucide-react"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { Header } from "@/components/header"
import { GoogleMapComponent } from "@/components/ui/google-map"
import { useIsMobile } from "@/hooks/use-mobile"

interface Garage {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviewCount: number;
  distance: string;
  priceRange: string;
  isSponsored: boolean;
  specialties: string;
  address: string;
  phone: string;
  openingHours: {
    weekdays: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  website: string;
  email: string;
  paymentMethods: string[];
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  description: string;
  services: string[];
  certifications: string[];
}

export default function SearchGaragesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("rating")
  const [selectedCategory, setSelectedCategory] = useState<string>("All Services")
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedContent, setSelectedContent] = useState("Websites")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedDistance, setSelectedDistance] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")
  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sample garage data with enhanced information
  const garages = Array.from({ length: 12 }).map((_, index) => ({
    id: `garage-${index + 1}`,
    name: `${['MHM Autohaus', 'Holmes Mechanics Ltd', 'Eurotuner', 'Supreme Auto Servicing', 'QuickFix Motors', 'Elite Auto Care', 'ProService Garage', 'AutoTech Solutions'][index % 8]}`,
    location: `${['Manchester', 'Birmingham', 'London', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Newcastle'][index % 8]}`,
    image: index < 9 ? `/garages/garage_${index + 1}.webp` : `/api/placeholder/300/200`,
    rating: 4.2 + (index * 0.1),
    reviewCount: 50 + (index * 15),
    distance: `${0.5 + (index * 0.3)} miles`,
    priceRange: ['£', '££', '£££'][index % 3],
    isSponsored: index < 2,
    specialties: ["MOT", "Servicing", "Repairs", "Diagnostics"][index % 4],
    address: `${index + 1} Example Street, ${['Manchester', 'Birmingham', 'London', 'Leeds'][index % 4]} M1 ${index}AA`,
    phone: `0123 ${String(index).padStart(3, '0')} ${String(index * 2).padStart(3, '0')}`,
    openingHours: {
      weekdays: { start: "08:00", end: "18:00" },
      saturday: { start: "09:00", end: "17:00" },
      sunday: { start: "10:00", end: "16:00" }
    },
    website: `https://garage${index + 1}.com`,
    email: `contact@garage${index + 1}.com`,
    paymentMethods: ["Cash", "Credit Card", "Debit Card"],
    socialMedia: {
      facebook: `https://facebook.com/garage${index + 1}`,
      twitter: `https://twitter.com/garage${index + 1}`,
      instagram: `https://instagram.com/garage${index + 1}`
    },
    description: `Professional automotive services with ${5 + index} years of experience. Specializing in ${['BMW and Mercedes', 'Ford and Vauxhall', 'Japanese vehicles', 'European cars'][index % 4]}.`,
    services: [
      "Electric issue repair", "Programming", "Commercial vehicle repair", "Sunroof repair",
      "Suspension repair", "Vehicle diagnostics", "Manual Gearbox repair", "Automatic Gearbox repair",
      "DPF Cleaning", "Starter motor/Alternator Repair", "Battery servicing", "Air conditioning",
      "Brakes and Clutches", "Electric car/van Repair", "Hybrid car repair", "LPG Repair",
      "Range Rover Specialist", "Wheel Alignment", "Tyre Change", "Car Accessories and Parts",
      "Garage Equipment", "Body Repair", "MOT", "Welding", "Turbochargers Repair", "Motorcycle repairs & services"
    ].slice(0, 5 + index % 10),
    certifications: ['RAC Approved', 'AA Certified', 'Trust My Garage'][index % 3] ? [['RAC Approved', 'AA Certified', 'Trust My Garage'][index % 3]] : []
  }))

  const allServices = [
    "Electric issue repair", "Programming", "Commercial vehicle repair", "Sunroof repair",
    "Suspension repair", "Vehicle diagnostics", "Manual Gearbox repair", "Automatic Gearbox repair",
    "DPF Cleaning", "Starter motor/Alternator Repair", "Battery servicing", "Air conditioning",
    "Brakes and Clutches", "Electric car/van Repair", "Hybrid car repair", "LPG Repair",
    "Range Rover Specialist", "Wheel Alignment", "Tyre Change", "Car Accessories and Parts",
    "Garage Equipment", "Body Repair", "MOT", "Welding", "Turbochargers Repair", "Motorcycle repairs & services"
  ]

  const categories = [
    { name: "All Services", count: 156 },
    { name: "MOT", count: 89 },
    { name: "Servicing", count: 142 },
    { name: "Diagnostics", count: 67 },
    { name: "Brakes", count: 98 },
    { name: "Tyres", count: 78 },
    { name: "Body Repair", count: 45 },
    { name: "Engine", count: 112 }
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
    setSelectedCategory("All Services")
    setSelectedServices([])
    setSelectedContent("Websites")
    setSelectedDistance("all")
    setSelectedRating("all")
  }

  // Filtering logic
  const filteredGarages = garages.filter(garage => {
    // Category filter (simulate by matching category to a service in the garage)
    const categoryMatch = selectedCategory === "All Services" || garage.services.includes(selectedCategory)
    // Services filter (all selected services must be present)
    const servicesMatch = selectedServices.length === 0 || selectedServices.every(service => garage.services.includes(service))
    // Content filter (simulate: always true, as we don't have content types in data)
    const contentMatch = true // Could be extended if data supports it
    // Rating filter
    const ratingMatch = selectedRating === "all" || garage.rating >= parseFloat(selectedRating)
    // Distance filter (not implemented, always true)
    return categoryMatch && servicesMatch && contentMatch && ratingMatch
  })

  // Pagination logic: show only first 9 garages per page
  const garagesToShow = filteredGarages.slice(0, 9)

  const GarageCard = ({ garage }: { garage: Garage }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Sponsored tag removed */}
      <div className="relative">
        <img 
          src={garage.image} 
          alt={garage.name} 
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-medium">
          {garage.priceRange}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {garage.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{garage.rating.toFixed(1)}</span>
            <span className="text-gray-500">({garage.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{garage.location} • {garage.distance}</span>
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

        {garage.certifications.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {garage.certifications.map((cert: string, i: number) => (
              <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                ✓ {cert}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Open until {garage.openingHours.weekdays.end}</span>
          </div>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header placeholder */}
      <div className="flex justify-center items-center py-4 mb-2">
        <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-none md:rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-blue-200 relative">
          <div className="hidden md:block md:w-2 md:h-full bg-gradient-to-b from-blue-400 to-blue-700 md:rounded-l-3xl md:rounded-t-none"></div>
          <form className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 p-4">
            {/* Reg Number Field */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="reg-number" className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Enter Reg Number</label>
              <Input
                id="reg-number"
                placeholder="e.g. AB12 CDE"
                className="w-full h-12 rounded-full bg-white/80 border border-blue-200 px-4 text-base"
                type="text"
                autoComplete="off"
              />
            </div>
            {/* Service Dropdown */}
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="service-filter" className="block text-xs font-semibold text-gray-700 mb-1 ml-1">What do you need?</label>
              <select
                id="service-filter"
                className="w-full pl-4 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 h-12"
                defaultValue=""
              >
                <option value="">All Services</option>
                {allServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
            {/* Postcode Field */}
            <div className="flex-1 min-w-[140px]">
              <label htmlFor="postcode" className="block text-xs font-semibold text-gray-700 mb-1 ml-1">Your Postcode</label>
              <Input
                id="postcode"
                placeholder="Postcode"
                className="w-full h-12 rounded-full bg-white/80 border border-blue-200 px-4 text-base"
                type="text"
                autoComplete="off"
              />
            </div>
            {/* Search Button */}
            <Button
              type="submit"
              className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-8 h-12 shadow-lg hover:scale-105 transition-transform duration-200 w-full md:w-auto"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
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
                  <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
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

                {/* Content Filter */}
                <div className="space-y-2">
                  <label htmlFor="content-select" className="text-sm font-medium text-gray-700">
                    Content Type
                  </label>
                  <select
                    id="content-select"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={selectedContent}
                    onChange={e => setSelectedContent(e.target.value)}
                  >
                    {contentTypes.map(content => (
                      <option key={content} value={content}>{content}</option>
                    ))}
                  </select>
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
                  <option value="rating">Highest rated</option>
                  <option value="distance">Nearest</option>
                  <option value="name">Name A-Z</option>
                  <option value="reviews">Most reviews</option>
                </select>
              </div>
            </div>

            {/* Garage listings */}
            {viewMode === "grid" ? (
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
                        <img src={garage.image} alt={garage.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-medium">
                          {garage.priceRange}
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
                              <span>{garage.location} • {garage.distance}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{garage.rating.toFixed(1)}</span>
                            <span className="text-gray-500">({garage.reviewCount})</span>
                          </div>
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

                        {garage.certifications.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            {garage.certifications.map((cert: string, i: number) => (
                              <span key={i} className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                                ✓ {cert}
                              </span>
                            ))}
                          </div>
                        )}

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
          {/* Need Advice Section */}
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

            {/* Service Cards Section */}
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

            {/* Apply to be a mechanic Section */}
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

            {/* Bottom CTA Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Are you a garage owner?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">Join our network of trusted mechanics and grow your business. Get access to new customers and manage your bookings easily.</p>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3">
                Join as a Garage Partner
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}