"use client";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Filter, Grid, List } from "lucide-react"
import { GarageCard } from "@/components/categories/garages/garage-listing"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState } from "react"
import { GoogleMapComponent } from "@/components/ui/google-map"

export default function SearchGaragesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("rating")

  // Sample garage data - in a real app, this would come from an API
  const garages = Array.from({ length: 8 }).map((_, index) => ({
    id: `garage-${index + 1}`,
    name: `Garage ${index + 1}`,
    location: `City ${index + 1}`,
    image: `/garages/garage${(index % 4) + 1}.jpg`,
    rating: 4.5 + (index * 0.1),
    specialties: ["MOT", "Servicing", "Repairs"],
    address: `${index + 1} Example Street, City ${index + 1}`,
    phone: `0123 ${index}${index}${index} ${index}${index}${index}`,
    openingHours: "Mon-Fri: 8am-6pm"
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Glassy Blue Themed Search Bar */}
      <div className="flex justify-center items-center py-4 mb-2">
        <div className="w-full max-w-4xl flex rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-blue-200 relative">
          {/* Accent Bar */}
          <div className="w-2 h-full bg-gradient-to-b from-blue-400 to-blue-700 rounded-l-3xl"></div>
          {/* Content */}
          <form className="flex flex-col md:flex-row flex-1 gap-3 md:gap-4 p-4 md:p-6 items-stretch md:items-end">
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <label htmlFor="garage-search" className="block text-xs font-semibold text-blue-900 mb-1 tracking-widest uppercase">Garage</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                <Input
                  id="garage-search"
                  placeholder="e.g. QuickFix Motors"
                  className="pl-12 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder-blue-400 h-12"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <label htmlFor="location-search" className="block text-xs font-semibold text-blue-900 mb-1 tracking-widest uppercase">Location</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                <Input
                  id="location-search"
                  placeholder="e.g. Manchester"
                  className="pl-12 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder-blue-400 h-12"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <label htmlFor="service-filter" className="block text-xs font-semibold text-blue-900 mb-1 tracking-widest uppercase">Service</label>
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                <select
                  id="service-filter"
                  className="w-full pl-12 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 h-12"
                >
                  <option value="">All Services</option>
                  <option value="mot">MOT</option>
                  <option value="servicing">Servicing</option>
                  <option value="repairs">Repairs</option>
                  <option value="diagnostics">Diagnostics</option>
                </select>
              </div>
            </div>
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

      {/* Results Section */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Map */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Find Garages Near You</h2>
              <div className="w-full h-[300px] rounded-2xl overflow-hidden">
                <GoogleMapComponent />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Garages</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Listings */}
          <div className="lg:w-2/3">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">Showing {garages.length} garages</p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "grid" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "list" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-sm font-medium mr-2">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px]"
                >
                  <option value="rating">Rating</option>
                  <option value="distance">Distance</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Garage listings */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {garages.map((garage) => (
                  <GarageCard key={garage.id} {...garage} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {garages.map((garage) => (
                  <div key={garage.id} className="flex bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="w-64 h-48 flex-shrink-0 relative">
                      <img src={garage.image} alt={garage.name} className="w-full h-full object-contain bg-white rounded-l-xl" />
                    </div>
                    {/* Details */}
                    <div className="flex-1 flex flex-col p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 mb-1">{garage.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {garage.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5c0 2.485-2.015 4.5-4.5 4.5S7.5 12.985 7.5 10.5 9.515 6 12 6s4.5 2.015 4.5 4.5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 4.142-3.358 7.5-7.5 7.5s-7.5-3.358-7.5-7.5a7.5 7.5 0 1115 0z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25V6a3 3 0 00-6 0v2.25M12 15v2.25m0 0a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {garage.specialties.map((spec, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{spec}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 mb-2">
                        <div><span className="font-medium">Address:</span> {garage.address}</div>
                        <div><span className="font-medium">Phone:</span> {garage.phone}</div>
                        <div><span className="font-medium">Hours:</span> {garage.openingHours}</div>
                        <div><span className="font-medium">Rating:</span> {garage.rating.toFixed(1)} / 5</div>
                      </div>
                      <div className="flex justify-end mt-auto">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-2">
              <Button variant="outline" className="px-4">Previous</Button>
              <Button variant="outline" className="px-4">1</Button>
              <Button variant="outline" className="px-4">2</Button>
              <Button variant="outline" className="px-4">3</Button>
              <Button variant="outline" className="px-4">Next</Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 