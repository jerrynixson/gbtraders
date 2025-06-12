"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Tag, MapPin, Sliders, X } from "lucide-react"

export function Hero() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string>("")
  const [postcode, setPostcode] = useState<string>("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const categories = ["Vehicles", "Breakdown Services", "Shop", "Garages", "Dealers"]

  const images = [
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_47_41 PM.png',
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_43_18 PM.png',
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_41_50 PM.png',
    '/banner_prop/ChatGPT Image Jun 9, 2025, 03_39_02 PM.png',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setNextImageIndex((currentImageIndex + 1) % images.length)
      
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex)
        setIsTransitioning(false)
      }, 1000)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentImageIndex, nextImageIndex, images.length])

  const handleSearch = () => {
    console.log({ selectedCategory, keywords, postcode })
  }

  const resetFilters = () => {
    setSelectedCategory(null)
    setKeywords("")
    setPostcode("")
  }

  return (
    <div className="relative mx-auto w-full max-w-[85rem] overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-blue-600 to-red-700 shadow-xl">
      <div className="flex min-h-[400px] flex-col lg:flex-row rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-filter backdrop-blur-xl">
        <div className="flex w-full flex-col justify-between p-6 lg:w-1/3 bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-r-none">
          <div>
            <h2 className="mb-6 text-center text-xl font-semibold text-white">Discover Your Perfect Drive</h2>

            <div className="space-y-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Tag className="h-5 w-5 text-blue-200" />
                </div>
                <Input
                  placeholder="Keywords"
                  className="h-12 w-full rounded-2xl border-none bg-white/10 pl-10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              <div className="flex space-x-3">
                <div className="relative flex-grow">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-5 w-5 text-blue-200" />
                  </div>
                  <Input
                    placeholder="Postcode"
                    className="h-12 w-full rounded-2xl border-none bg-white/10 pl-10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-[150px] justify-start rounded-2xl border-none bg-white/10 text-left text-sm text-white ring-1 ring-inset ring-white/20"
                      >
                        <Sliders className="mr-2 h-5 w-5 text-blue-200" />
                        {selectedCategory || "Category"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[150px] rounded-2xl">
                      {categories.map((category) => (
                        <DropdownMenuItem
                          key={category}
                          onSelect={() => setSelectedCategory(selectedCategory === category ? null : category)}
                          className={`cursor-pointer text-sm ${
                            selectedCategory === category ? "bg-blue-100 font-semibold text-blue-800" : ""
                          }`}
                        >
                          {category}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Button
                className="h-12 w-full rounded-2xl bg-white/20 text-base text-white hover:bg-white/30"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-5 w-5" /> Search
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <Button 
                variant="outline" 
                className="rounded-full bg-white/5 backdrop-blur-sm px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                onClick={resetFilters}
              >
                Reset filters
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full bg-white/5 backdrop-blur-sm px-4 py-2 text-white/70 hover:bg-white/10 hover:text-white border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                onClick={() => setShowFilters(!showFilters)}
              >
                More options
              </Button>
            </div>
          </div>
        </div>

        <div
          className="relative flex w-full items-center justify-center rounded-2xl p-6 lg:w-2/3 lg:rounded-l-none overflow-hidden"
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
                  {/* Price Range */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Price Range</h3>
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

                  {/* Make and Model */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Make and Model</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Make"
                        className="h-7 rounded-lg text-xs bg-white/50"
                      />
                      <Input
                        placeholder="Model"
                        className="h-7 rounded-lg text-xs bg-white/50"
                      />
                    </div>
                  </div>

                  {/* Mileage */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Mileage</h3>
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

                  {/* Features */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Features</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Auto</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Manual</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">4x4</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Hybrid</Button>
                    </div>
                  </div>

                  {/* Fuel Type */}
                  <div className="col-span-2 space-y-1.5">
                    <h3 className="text-xs font-medium text-gray-600">Fuel Type</h3>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Petrol</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Diesel</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Electric</Button>
                      <Button variant="outline" className="h-6 rounded-lg text-xs px-1 bg-white/50 hover:bg-white/80">Hybrid</Button>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/5 p-6 text-white lg:rounded-l-none">
                <div className="flex flex-col items-center">
                  <div className="mb-6 grid grid-cols-3 gap-2">
                    <div className="h-2 w-8 bg-red-400 rounded-full"></div>
                    <div className="h-2 w-8 bg-blue-500 rounded-full"></div>
                    <div className="h-2 w-8 bg-red-400 rounded-full"></div>
                  </div>
                  <h1 className="mb-4 text-center text-5xl font-bold uppercase leading-tight md:text-6xl drop-shadow-lg">
                    WELCOME TO GB TRADER
                  </h1>
                  <div className="mb-8 grid grid-cols-3 gap-2">
                    <div className="h-2 w-8 bg-blue-500 rounded-full"></div>
                    <div className="h-2 w-8 bg-red-400 rounded-full"></div>
                    <div className="h-2 w-8 bg-blue-500 rounded-full"></div>
                  </div>
                  <Button className="rounded-2xl bg-white/20 backdrop-blur-md px-8 py-3 text-lg font-semibold text-white shadow-md hover:bg-white/30 border border-white/30">
                    Find yours
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
