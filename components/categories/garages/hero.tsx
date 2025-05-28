"use client";

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Search, Wrench, MapPin, CircleDollarSign, Truck } from "lucide-react"

interface HeroProps {
  backgroundImage?: string;
  onSearch?: (garageName: string, location: string, searchRadius: string, serviceType: string | null, vehicleType: string | null) => void;
}

export function Hero({
  backgroundImage = '/banner-home.jpg',
  onSearch
}: HeroProps) {
  const [garageName, setGarageName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [searchRadius, setSearchRadius] = useState<string>('10');
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Service types
  const serviceTypes = [
    "MOT",
    "Servicing",
    "Repairs",
    "Diagnostics",
    "Bodywork",
    "Electrical",
    "Brakes",
    "Tyres",
    "Air Conditioning",
    "Engine Repair"
  ];

  // Vehicle types
  const vehicleTypes = [
    "Small Van",
    "Medium Van", 
    "Large Van",
    "Pickup",
    "Luton Box",
    "Dropside",
    "Tipper",
    "Minibus",
    "Refrigerated",
    "Chassis Cab"
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress (0 to 1)
      const progress = Math.min(scrollTop / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(garageName, location, searchRadius, selectedServiceType, selectedVehicleType);
    }
  };

  const resetFilters = () => {
    setGarageName('');
    setLocation('');
    setSearchRadius('10');
    setSelectedServiceType(null);
    setSelectedVehicleType(null);
  };

  return (
    <div 
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        transform: `translateY(-${scrollProgress * 50}%)`,
        opacity: 1 - scrollProgress,
        filter: `blur(${scrollProgress * 5}px)`
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-50"
        style={{ 
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Content Container */}
      <div className="relative container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
        {/* Left Side - Welcome Text */}
        <div className="w-full md:w-1/2 text-white z-10 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            WELCOME TO 
            <span className="block text-primary">GB TRADERS</span>
          </h1>
          <p className="text-xl italic">Drive off today</p>
        </div>

        {/* Right Side - Search Box */}
        <div className="w-full md:w-1/2 z-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-center mb-6">
              Find a Garage Near You
            </h2>

            {/* Search Inputs */}
            <div className="space-y-4">
              {/* Garage Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Wrench className="text-primary h-5 w-5" />
                </div>
                <Input 
                  placeholder="Garage name (optional)" 
                  className="pl-10 h-12 text-sm"
                  value={garageName}
                  onChange={(e) => setGarageName(e.target.value)}
                />
              </div>

              {/* Location and Radius Row */}
              <div className="flex space-x-2">
                {/* Location Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="text-primary h-5 w-5" />
                  </div>
                  <Input 
                    placeholder="Location or Postcode" 
                    className="pl-10 h-12 text-sm"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                {/* Radius Dropdown */}
                <div className="w-32">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start text-left text-sm"
                      >
                        {searchRadius} miles
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {["5", "10", "15", "25", "50"].map((radius) => (
                        <DropdownMenuItem 
                          key={radius}
                          onSelect={() => setSearchRadius(radius)}
                          className={`cursor-pointer text-sm ${
                            searchRadius === radius 
                              ? "bg-primary/10 font-semibold" 
                              : ""
                          }`}
                        >
                          {radius} miles
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Service Type Dropdown */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 justify-start text-left text-sm"
                    >
                      <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                      {selectedServiceType || 'Service Type'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-56 overflow-y-auto">
                    {serviceTypes.map((type) => (
                      <DropdownMenuItem 
                        key={type}
                        onSelect={() => setSelectedServiceType(
                          selectedServiceType === type ? null : type
                        )}
                        className={`cursor-pointer text-sm ${
                          selectedServiceType === type 
                            ? "bg-primary/10 font-semibold" 
                            : ""
                        }`}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Vehicle Type Dropdown */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 justify-start text-left text-sm"
                    >
                      <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                      {selectedVehicleType || 'Vehicle Type'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-56 overflow-y-auto">
                    {vehicleTypes.map((type) => (
                      <DropdownMenuItem 
                        key={type}
                        onSelect={() => setSelectedVehicleType(
                          selectedVehicleType === type ? null : type
                        )}
                        className={`cursor-pointer text-sm ${
                          selectedVehicleType === type 
                            ? "bg-primary/10 font-semibold" 
                            : ""
                        }`}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Search Button */}
              <Button 
                className="w-full h-12 text-sm"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-5 w-5" /> Find Garages
              </Button>

              {/* Additional Links */}
              <div className="flex justify-between text-sm">
                <Button 
                  variant="link" 
                  className="text-gray-500 p-0"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
                <Button variant="link" className="text-primary p-0">
                  More options
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero