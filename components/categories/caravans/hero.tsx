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
import { Search, Tag, MapPin, Sliders, X } from "lucide-react"

interface HeroProps {
  backgroundImage?: string;
  onSearch?: (make: string | null, model: string | null, minPrice: string, maxPrice: string, bodyType: string | null) => void;
}

export function Hero({
  backgroundImage = '/banner-home.jpg',
  onSearch
}: HeroProps) {
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Popular caravan makes
  const caravanMakes = [
    "Bailey",
    "Swift",
    "Lunar",
    "Elddis",
    "Coachman",
    "Adria",
    "Knaus",
    "Hobby",
    "Fendt",
    "Dethleffs"
  ];

  // Caravan body types
  const bodyTypes = [
    "Single Axle",
    "Twin Axle",
    "Fixed Bed",
    "End Washroom",
    "Island Bed",
    "French Bed",
    "End Kitchen",
    "Side Dinette",
    "Family Layout",
    "Luxury"
  ];

  const images = [
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_47_41 PM.png',
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_43_18 PM.png',
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_41_50 PM.png',
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_39_02 PM.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setNextImageIndex((currentImageIndex + 1) % images.length);
      
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setIsTransitioning(false);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentImageIndex, nextImageIndex, images.length]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(make, model, minPrice, maxPrice, bodyType);
    }
  };

  const resetFilters = () => {
    setMake(null);
    setModel(null);
    setMinPrice("");
    setMaxPrice("");
    setBodyType(null);
  };

  return (
    <div className="relative mx-auto w-full max-w-[85rem] overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-blue-600 to-red-700 shadow-xl">
      <div className="flex min-h-[400px] flex-col lg:flex-row rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-filter backdrop-blur-xl">
        {/* Search Section - Full width on mobile */}
        <div className="flex w-full flex-col justify-between p-4 sm:p-6 lg:w-1/3 bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-r-none order-2 lg:order-1">
          <div>
            <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl font-semibold text-white">Find Your Perfect Caravan</h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Make and Model Row */}
              <div className="flex space-x-2 sm:space-x-3">
                <div className="relative flex-grow">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 sm:h-12 w-full justify-start rounded-xl sm:rounded-2xl border-none bg-white/10 text-left text-sm text-white ring-1 ring-inset ring-white/20"
                      >
                        <Tag className="h-4 sm:h-5 w-4 sm:w-5 text-blue-200 mr-2" />
                        {make || "Make"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full rounded-xl sm:rounded-2xl">
                      {caravanMakes.map((makeOption) => (
                        <DropdownMenuItem
                          key={makeOption}
                          onSelect={() => setMake(make === makeOption ? null : makeOption)}
                          className={`cursor-pointer text-sm ${
                            make === makeOption ? "bg-blue-100 font-semibold text-blue-800" : ""
                          }`}
                        >
                          {makeOption}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="relative flex-grow">
                  <Input
                    placeholder="Model"
                    className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl border-none bg-white/10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60"
                    value={model || ""}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
              </div>

              {/* Price Range Row */}
              <div className="flex space-x-2 sm:space-x-3">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Min Price"
                    className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl border-none bg-white/10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>

                <div className="relative flex-grow">
                  <Input
                    placeholder="Max Price"
                    className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl border-none bg-white/10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Body Type Dropdown */}
              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 sm:h-12 w-full justify-start rounded-xl sm:rounded-2xl border-none bg-white/10 text-left text-sm text-white ring-1 ring-inset ring-white/20"
                    >
                      <Sliders className="h-4 sm:h-5 w-4 sm:w-5 text-blue-200 mr-2" />
                      {bodyType || "Body Type"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full rounded-xl sm:rounded-2xl">
                    {bodyTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onSelect={() => setBodyType(bodyType === type ? null : type)}
                        className={`cursor-pointer text-sm ${
                          bodyType === type ? "bg-blue-100 font-semibold text-blue-800" : ""
                        }`}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl bg-white/20 text-sm sm:text-base text-white hover:bg-white/30"
                onClick={handleSearch}
              >
                <Search className="h-4 sm:h-5 w-4 sm:w-5" /> Search
              </Button>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between text-sm">
              <Button 
                variant="outline" 
                className="rounded-full bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/70 hover:bg-white/10 hover:text-white border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/70 hover:bg-white/10 hover:text-white border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                onClick={() => setShowFilters(!showFilters)}
              >
                More options
              </Button>
            </div>
          </div>
        </div>

        {/* Image Section - Reduced height on mobile */}
        <div
          className="relative flex w-full items-center justify-center h-[250px] sm:h-[300px] lg:h-auto rounded-2xl p-4 sm:p-6 lg:w-2/3 lg:rounded-l-none overflow-hidden order-1 lg:order-2"
        >
          {showFilters ? (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl shadow-2xl shadow-inner rounded-2xl border border-white/30">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-5 py-3 border-b border-gray-200/50">
                  <h2 className="text-base font-semibold text-gray-800">Advanced Filters</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                    className="rounded-full hover:bg-gray-100 h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4">
                  {/* Year Range */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Year Range</h3>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="From"
                        className="h-7 rounded-lg text-xs bg-white/50"
                      />
                      <Input
                        type="number"
                        placeholder="To"
                        className="h-7 rounded-lg text-xs bg-white/50"
                      />
                    </div>
                  </div>

                  {/* Berths */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Berths</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">2</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">4</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">6</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">8+</Button>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Condition</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">New</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Used</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Certified</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Salvage</Button>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Weight (kg)</h3>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        className="h-7 rounded-lg text-xs bg-white/50"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        className="h-7 rounded-lg text-xs bg-white/50"
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="col-span-2 space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Features</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Heating</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">A/C</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Awning</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Solar</Button>
                    </div>
                  </div>

                  {/* Additional Features */}
                  <div className="col-span-2 space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Additional Features</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Shower</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Toilet</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Kitchen</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">TV</Button>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-gray-200/50 flex justify-center gap-3">
                  <Button
                    className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 h-7 text-xs px-4"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-lg h-7 text-xs px-4 bg-white/50 hover:bg-white/80"
                    onClick={() => setShowFilters(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  backgroundImage: `url('${images[currentImageIndex]}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 1,
                }}
              />
              <div
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  backgroundImage: `url('${images[nextImageIndex]}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: isTransitioning ? 1 : 0,
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/5 p-4 sm:p-6 text-white lg:rounded-l-none">
                <div className="flex flex-col items-center">
                  <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-1 sm:gap-2">
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-red-400 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-blue-500 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-red-400 rounded-full"></div>
                  </div>
                  <h1 className="mb-3 sm:mb-4 text-center text-3xl sm:text-4xl md:text-5xl font-bold uppercase leading-tight drop-shadow-lg">
                    CARAVANS
                  </h1>
                  <div className="mb-6 sm:mb-8 grid grid-cols-3 gap-1 sm:gap-2">
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-blue-500 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-red-400 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}