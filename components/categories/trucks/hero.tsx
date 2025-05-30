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
import { Search, Truck, CircleDollarSign, MapPin } from "lucide-react"

interface HeroProps {
  backgroundImage?: string;
  onSearch?: (make: string | null, model: string | null, minPrice: string, maxPrice: string, truckType: string | null) => void;
}

export function Hero({
  backgroundImage = '/banner-home.jpg',
  onSearch
}: HeroProps) {
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedTruckType, setSelectedTruckType] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Popular UK truck brands
  const truckBrands = [
    "DAF",
    "Scania",
    "Volvo",
    "Mercedes-Benz",
    "MAN",
    "Iveco",
    "Renault",
    "Isuzu",
    "Fuso",
    "Hino"
  ];

  // Truck types
  const truckTypes = [
    "Rigid",
    "Articulated",
    "Box Truck",
    "Flatbed",
    "Refrigerated",
    "Tipper",
    "Tanker",
    "Curtainsider",
    "Low Loader",
    "Specialized"
  ];

  // Example models - these would ideally be populated based on the selected make
  const truckModels: Record<string, string[]> = {
    "DAF": ["XF", "CF", "LF", "XG", "XG+", "XF Super Space Cab"],
    "Scania": ["R-Series", "G-Series", "P-Series", "S-Series", "R 500", "G 410"],
    "Volvo": ["FH", "FM", "FMX", "FE", "FL", "FH16"],
    "Mercedes-Benz": ["Actros", "Arocs", "Atego", "Econic", "Unimog", "eActros"],
    "MAN": ["TGX", "TGS", "TGM", "TGL", "eTGS", "eTGX"],
    "Iveco": ["S-Way", "X-Way", "T-Way", "Daily", "Eurocargo", "Stralis"],
    "Renault": ["T-High", "T-Range", "C-Range", "K-Range", "D-Range", "E-Tech"],
    "Isuzu": ["Forward", "Elf", "Giga", "N-Series", "F-Series", "Q-Series"],
    "Fuso": ["Canter", "Fighter", "Shogun", "eCanter", "FJ", "FZ"],
    "Hino": ["500 Series", "300 Series", "700 Series", "Dutro", "Profia", "Ranger"]
  };

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

  // Reset model when make changes
  useEffect(() => {
    setSelectedModel(null);
  }, [selectedMake]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(selectedMake, selectedModel, minPrice, maxPrice, selectedTruckType);
    }
  };

  const resetFilters = () => {
    setSelectedMake(null);
    setSelectedModel(null);
    setMinPrice('');
    setMaxPrice('');
    setSelectedTruckType(null);
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
            <span className="block text-primary">GB TRADER</span>
          </h1>
          <p className="text-xl italic">Drive off today</p>
        </div>

        {/* Right Side - Search Box */}
        <div className="w-full md:w-1/2 z-10">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-center mb-6">
              Find Your Perfect Truck
            </h2>

            {/* Search Inputs */}
            <div className="space-y-4">
              {/* Make and Model Row */}
              <div className="flex space-x-2">
                {/* Make Dropdown */}
                <div className="flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start text-left text-sm"
                      >
                        <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                        {selectedMake || 'Make'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-56 overflow-y-auto">
                      {truckBrands.map((brand) => (
                        <DropdownMenuItem 
                          key={brand}
                          onSelect={() => setSelectedMake(
                            selectedMake === brand ? null : brand
                          )}
                          className={`cursor-pointer text-sm ${
                            selectedMake === brand 
                              ? "bg-primary/10 font-semibold" 
                              : ""
                          }`}
                        >
                          {brand}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Model Dropdown */}
                <div className="flex-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-12 justify-start text-left text-sm"
                        disabled={!selectedMake}
                      >
                        {selectedModel || 'Model'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-56 overflow-y-auto">
                      {selectedMake && truckModels[selectedMake]?.map((model) => (
                        <DropdownMenuItem 
                          key={model}
                          onSelect={() => setSelectedModel(
                            selectedModel === model ? null : model
                          )}
                          className={`cursor-pointer text-sm ${
                            selectedModel === model 
                              ? "bg-primary/10 font-semibold" 
                              : ""
                          }`}
                        >
                          {model}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Min and Max Price Row */}
              <div className="flex space-x-2">
                {/* Min Price Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CircleDollarSign className="text-primary h-5 w-5" />
                  </div>
                  <Input 
                    placeholder="Min Price" 
                    className="pl-10 h-12 text-sm"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                {/* Max Price Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CircleDollarSign className="text-primary h-5 w-5" />
                  </div>
                  <Input 
                    placeholder="Max Price" 
                    className="pl-10 h-12 text-sm"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Truck Type Dropdown */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 justify-start text-left text-sm"
                    >
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      {selectedTruckType || 'Truck Type'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {truckTypes.map((type) => (
                      <DropdownMenuItem 
                        key={type}
                        onSelect={() => setSelectedTruckType(
                          selectedTruckType === type ? null : type
                        )}
                        className={`cursor-pointer text-sm ${
                          selectedTruckType === type 
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
                <Search className="mr-2 h-5 w-5" /> Search
              </Button>

              {/* Additional Links */}
              <div className="flex justify-between">
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