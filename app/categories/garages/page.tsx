"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Filter, Grid, List, Star, Clock, Phone, Globe, Mail, Facebook, Twitter, Instagram, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Header } from "@/components/header"

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
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedDistance, setSelectedDistance] = useState("all")
  const [selectedRating, setSelectedRating] = useState("all")
  const [showContentFilters, setShowContentFilters] = useState(false)
  const [selectedContent, setSelectedContent] = useState("Websites")

  // Sample garage data with enhanced information
  const garages = Array.from({ length: 12 }).map((_, index) => ({
    id: `garage-${index + 1}`,
    name: `${['MHM Autohaus', 'Holmes Mechanics Ltd', 'Eurotuner', 'Supreme Auto Servicing', 'QuickFix Motors', 'Elite Auto Care', 'ProService Garage', 'AutoTech Solutions'][index % 8]}`,
    location: `${['Manchester', 'Birmingham', 'London', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Newcastle'][index % 8]}`,
    image: `/api/placeholder/300/200`,
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

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const filteredGarages = garages.filter(garage => {
    const serviceMatch = selectedServices.length === 0 || 
      selectedServices.some(service => garage.services.includes(service))
    const ratingMatch = selectedRating === "all" || garage.rating >= parseFloat(selectedRating)
    return serviceMatch && ratingMatch
  })

  const GarageCard = ({ garage }: { garage: Garage }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {garage.isSponsored && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1">
          SPONSORED
        </div>
      )}
      
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
        <div className="w-full max-w-4xl flex rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-blue-200 relative">
          <div className="w-2 h-full bg-gradient-to-b from-blue-400 to-blue-700 rounded-l-3xl"></div>
          <form className="flex-1 flex items-center gap-4 p-4">
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-100 p-6 sticky top-4 flex flex-col gap-8">
              {/* Map Preview - Glassmorphic Card */}
              <div className="relative flex flex-col items-center mb-2">
                <div className="w-full h-40 rounded-2xl bg-white/30 backdrop-blur-md shadow-md overflow-hidden flex items-center justify-center border border-blue-100">
                  <img src="/map-preview.png" alt="Map preview" className="object-cover w-full h-full" />
                  <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/60 backdrop-blur-md border border-yellow-400 text-black font-bold px-6 py-2 rounded-xl shadow-md text-base hover:bg-yellow-100 transition-all">
                    View map
                  </button>
                </div>
              </div>

              {/* Filter header - force divider flush below */}
              <div className="flex items-center gap-2 mb-0 mt-0 p-0 h-auto min-h-0">
                <Filter className="h-6 w-6 text-blue-700" />
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Filter</h2>
              </div><div className="h-px bg-gradient-to-r from-blue-200/60 via-transparent to-blue-200/60 m-0 mb-4 p-0" />

              {/* Category Filter (always expanded) */}
              <div className="mb-4">
                <span className="font-semibold text-gray-900 text-lg mb-3 block">Category</span>
                <div className="flex flex-col gap-3 pl-1">
                  {[
                    "Mobile Mechanics", "Garage Services", "Mot Testing", "Car Servicing", "Brakes & Clutches", "Breakdown Recovery", "Tyres", "Car Electrics", "Car Diagnostics", "Mobile Tyre Fitting", "Engine Reconditioning", "Commercial Vehicle Repairs", "Car Body Repairs", "Brakes Repairs", "Engine Diagnostics"
                  ].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 text-base text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        className="accent-blue-600 w-4 h-4 border-2 border-blue-400 focus:ring-2 focus:ring-blue-300 transition-all"
                        checked={selectedServices[0] === cat}
                        onChange={() => setSelectedServices([cat])}
                      />
                      <span className="font-medium">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-blue-200/60 via-transparent to-blue-200/60 my-2" />

              {/* Content Filter (always expanded) */}
              <div className="mb-2">
                <span className="font-semibold text-gray-900 text-lg mb-3 block">Content</span>
                <div className="flex flex-col gap-3 pl-1">
                  {[
                    "Websites", "Photos", "Reviews", "Videos", "Messaging"
                  ].map((content) => (
                    <label key={content} className="flex items-center gap-3 text-base text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        name="content"
                        value={content}
                        className="accent-blue-600 w-4 h-4 border-2 border-blue-400 focus:ring-2 focus:ring-blue-300 transition-all"
                        checked={selectedContent === content}
                        onChange={() => setSelectedContent(content)}
                      />
                      <span className="font-medium">{content}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Results */}
          <div className="lg:w-3/4">
            {/* Feature Bar - now above results header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-6 px-4 py-6 bg-white/70 backdrop-blur rounded-2xl shadow mb-6">
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>
                <div>
                  <div className="font-bold text-gray-900">Up to 47% cheaper</div>
                  <div className="text-xs text-gray-500">Versus franchise garages</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm6 0c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm-6 8v-2a4 4 0 00-4-4H5a2 2 0 00-2 2v2a2 2 0 002 2h2a4 4 0 004-4zm6 0v-2a4 4 0 00-4-4h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a4 4 0 004-4z" /></svg>
                <div>
                  <div className="font-bold text-gray-900">Fully vetted &amp; qualified mechanics</div>
                  <div className="text-xs text-gray-500">Nationwide mechanics</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <div>
                  <div className="font-bold text-gray-900">1-year warranty</div>
                  <div className="text-xs text-gray-500">On all parts and repairs</div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <div>
                  <div className="font-bold text-gray-900">Same or next-day bookings</div>
                  <div className="text-xs text-gray-500">At your home or office</div>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{filteredGarages.length}</span> of <span className="font-semibold">{garages.length}</span> garages
                </p>
                <div className="flex items-center space-x-2">
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
              
              <div className="flex items-center gap-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGarages.map((garage: Garage) => (
                  <GarageCard key={garage.id} garage={garage} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredGarages.map((garage: Garage) => (
                  <div key={garage.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                    {garage.isSponsored && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-4 py-2">
                        SPONSORED
                      </div>
                    )}
                    
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
            <div className="flex justify-center mt-8 gap-2">
              <Button variant="outline" className="px-4 hover:bg-blue-50">Previous</Button>
              <Button variant="outline" className="px-4 bg-blue-600 text-white hover:bg-blue-700">1</Button>
              <Button variant="outline" className="px-4 hover:bg-blue-50">2</Button>
              <Button variant="outline" className="px-4 hover:bg-blue-50">3</Button>
              <Button variant="outline" className="px-4 hover:bg-blue-50">Next</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer placeholder */}
      <div className="bg-gray-900 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">© 2024 Garage Finder. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}