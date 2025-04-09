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
import { Search, Tag, MapPin, Sliders } from "lucide-react"

interface HeroProps {
  backgroundImage?: string;
  onSearch?: (category: string | null, keywords: string, postcode: string) => void;
}

export function Hero({
  backgroundImage = '/banner-home.jpg',
  onSearch
}: HeroProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);

  const categories = [
    "Vehicles",
    "Breakdown Services", 
    "Car Parts",
    "Garages",
    "Dealers"
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
      onSearch(selectedCategory, keywords, postcode);
    }
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setKeywords('');
    setPostcode('');
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
              Discover Your Perfect Drive
            </h2>

            {/* Search Inputs */}
            <div className="space-y-4">
              {/* Keywords Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="text-primary h-5 w-5" />
                </div>
                <Input 
                  placeholder="Keywords" 
                  className="pl-10 h-12 text-sm"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              {/* Postcode and Category Row */}
              <div className="flex space-x-2">
                {/* Postcode Input */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="text-primary h-5 w-5" />
                  </div>
                  <Input 
                    placeholder="Postcode" 
                    className="pl-10 h-12 text-sm"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>

                {/* Category Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-[120px] h-12 justify-start text-left text-sm"
                    >
                      <Sliders className="mr-2 h-4 w-4 text-muted-foreground" />
                      {selectedCategory || 'Category'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[120px]">
                    {categories.map((category) => (
                      <DropdownMenuItem 
                        key={category}
                        onSelect={() => setSelectedCategory(
                          selectedCategory === category ? null : category
                        )}
                        className={`cursor-pointer text-sm ${
                          selectedCategory === category 
                            ? "bg-primary/10 font-semibold" 
                            : ""
                        }`}
                      >
                        {category}
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