"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter, Grid, List, Star, Phone, Clock, Shield, Wrench, Truck } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type BreakdownService = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  services: string[];
  address: string;
  phone: string;
  openingHours: string;
  description: string;
};

function BreakdownServiceCard({ id, name, location, image, rating, services, address, phone, openingHours, description }: BreakdownService) {
  return (
    <Link href={`/categories/breakdown-services/${id}`} className="block group cursor-pointer">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all hover:shadow-lg">
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={400}
            height={250}
            className="w-full h-48 object-contain bg-white"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <span className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {location}
            </span>
          </div>
          <div className="flex items-center mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
            ))}
            <span className="text-sm text-gray-500 ml-2">{rating}/5</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {services.map((service: string, index: number) => (
              <span key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                {service}
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-600 space-y-1 mb-4">
            <p className="truncate">{address}</p>
            <p className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {phone}
            </p>
            <p className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {openingHours}
            </p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white pointer-events-none">
            Contact Service
          </Button>
        </div>
      </div>
    </Link>
  );
}

export default function BreakdownServicesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");

  // Sample breakdown service data
  const breakdownServices = Array.from({ length: 8 }).map((_, index) => ({
    id: `service-${index + 1}`,
    name: `Breakdown Service ${index + 1}`,
    location: `City ${index + 1}`,
    image: `/breakdown/breakdown${(index % 4) + 1}.jpg`,
    rating: 4.2 + (index * 0.2),
    services: ["Roadside Assistance", "Recovery", "Home Start", "Onward Travel"],
    address: `${index + 1} Service Street, City ${index + 1}`,
    phone: `0123 ${index}${index}${index} ${index}${index}${index}`,
    openingHours: "24/7 Emergency Service",
    description: "Professional breakdown and recovery services available 24/7 across the UK."
  }));
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="service-search" className="block text-xs font-semibold text-blue-900 mb-1 tracking-widest uppercase">Service Provider</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                <Input
                  id="service-search"
                  placeholder="e.g. AA Breakdown"
                  className="pl-12 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder-blue-400 h-12"
                />
                </div>
                </div>
            <div className="flex-1">
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
            <div className="flex items-end">
              <Button className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-full">
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Map */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Find Services Near You</h2>
              <div className="w-full h-[300px] bg-gray-200 rounded-2xl flex items-center justify-center text-blue-400">
                Map Placeholder
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Breakdown Services</span>
            </div>
          </div>
        </div>
      </div>
      
          {/* Right: Listings */}
          <div className="lg:w-2/3">
            {/* View Options */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">Showing {breakdownServices.length} services</p>
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium mr-2">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px]"
                >
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            
            {/* Service Listings */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {breakdownServices.map((service) => (
                  <BreakdownServiceCard key={service.id} {...service} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {breakdownServices.map((service) => (
                  <div key={service.id} className="flex bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="w-64 h-48 flex-shrink-0 relative">
                      <Image src={service.image} alt={service.name} width={256} height={192} className="w-full h-full object-contain bg-white rounded-l-xl" />
            </div>
                    <div className="flex-1 flex flex-col p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 mb-1">{service.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {service.location}
              </div>
            </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <Star className="w-5 h-5 text-yellow-400" />
                          </Button>
            </div>
          </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {service.services.map((s, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-700 space-y-1 mb-4">
                        <div><span className="font-medium">Address:</span> {service.address}</div>
                        <div><span className="font-medium">Phone:</span> {service.phone}</div>
                        <div><span className="font-medium">Hours:</span> {service.openingHours}</div>
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
  );
} 