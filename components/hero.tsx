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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const categories = [
    "Vehicles",
    "Breakdown Services", 
    "Car Parts",
    "Garages",
    "Dealers"
  ];

  const bannerImages = [
    '/banner/IMG-20250607-WA0004.jpg',
    '/banner/IMG-20250607-WA0005.jpg',
    '/banner/IMG-20250607-WA0006.jpg',
    '/banner/IMG-20250607-WA0007.jpg',
    '/banner/IMG-20250607-WA0008.jpg',
    '/banner/IMG-20250608-WA0001.jpg',
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

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

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  const nextSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
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
      {/* Background Image Slideshow */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-50 transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url('${bannerImages[currentImageIndex]}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-300"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dots Navigation */}
        <div className="flex space-x-2">
          {bannerImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentImageIndex === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-300"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

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