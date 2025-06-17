"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Tag, MapPin, Sliders, X } from "lucide-react"

// Custom hook for drag-to-scroll
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let isDown = false
    let startX = 0
    let scrollLeft = 0
    const onMouseDown = (e: MouseEvent) => {
      isDown = true
      el.classList.add('dragging')
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    const onMouseLeave = () => {
      isDown = false
      el.classList.remove('dragging')
    }
    const onMouseUp = () => {
      isDown = false
      el.classList.remove('dragging')
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5 // scroll-fast
      el.scrollLeft = scrollLeft - walk
    }
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseleave', onMouseLeave)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)
    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseleave', onMouseLeave)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mousemove', onMouseMove)
    }
  }, [])
  return ref
}

export function Hero() {
  const router = useRouter()
  const [selectedDropdownCategory, setSelectedDropdownCategory] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string>("")
  const [postcode, setPostcode] = useState<string>("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [nextImageIndex, setNextImageIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null)
  const dragData = useRef({ startX: 0, lastX: 0, dragging: false, moved: false })

  const categories = ["Vehicles", "Breakdown Services", "Shop", "Garages", "Dealers"]
  const vehicleTypes = [
    "Cars",
    "Vans",
    "Motorcycles",
    "Trucks",
    "Electric Vehicles",
    "Caravans",
    "E-Bikes"
  ]

  // Mapping vehicle types to their category pages
  const vehicleTypeToPageMap: Record<string, string> = {
    "Cars": "/categories/cars",
    "Vans": "/categories/vans",
    "Motorcycles": "/categories/motorcycles",
    "Trucks": "/categories/trucks",
    "Electric Vehicles": "/categories/electric-vehicles",
    "Caravans": "/categories/caravans",
    "E-Bikes": "/categories/e-bikes"
  }

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

  // Carousel auto-advance
  useEffect(() => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
    autoAdvanceRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % vehicleTypes.length)
    }, 3000)
    return () => {
      if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
    }
  }, [vehicleTypes.length])

  // Drag/swipe handlers for carousel
  const carouselRef = useRef<HTMLDivElement>(null)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
    setIsDragging(true)
    dragData.current.dragging = true
    dragData.current.moved = false
    dragData.current.startX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    dragData.current.lastX = dragData.current.startX
  }
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragData.current.dragging) return
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    dragData.current.lastX = x
    const offset = x - dragData.current.startX
    setDragOffset(offset)
    if (Math.abs(offset) > 5) dragData.current.moved = true
  }
  const handleDragEnd = () => {
    if (!dragData.current.dragging) return
    const delta = dragData.current.lastX - dragData.current.startX
    let newIndex = carouselIndex
    if (Math.abs(delta) > 50) {
      if (delta < 0) {
        newIndex = (carouselIndex + 1) % vehicleTypes.length
      } else {
        newIndex = (carouselIndex - 1 + vehicleTypes.length) % vehicleTypes.length
      }
    }
    setCarouselIndex(newIndex)
    setDragOffset(0)
    setIsDragging(false)
    dragData.current.dragging = false
    // Restart auto-advance
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current)
    autoAdvanceRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % vehicleTypes.length)
    }, 3000)
  }
  // Prevent click if drag happened
  const handleButtonClick = (idx: number) => {
    if (dragData.current.moved) return
    setCarouselIndex(idx)
    
    // Navigate to the corresponding category page
    const selectedVehicleType = vehicleTypes[idx]
    const targetPage = vehicleTypeToPageMap[selectedVehicleType]
    
    if (targetPage) {
      router.push(targetPage)
    }
  }

  const handleSearch = () => {
    console.log({ selectedDropdownCategory, keywords, postcode })
  }

  const resetFilters = () => {
    setSelectedDropdownCategory(null)
    setKeywords("")
    setPostcode("")
  }

  return (
    <div className="relative mx-auto w-full max-w-[85rem] overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-blue-600 to-red-700 shadow-xl">
      <div className="flex min-h-[400px] flex-col lg:flex-row rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-filter backdrop-blur-xl">
        {/* Search Section - Full width on mobile */}
        <div className="flex w-full flex-col justify-between p-4 sm:p-6 lg:w-1/3 bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-r-none order-2 lg:order-1">
          <div>
            <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl font-semibold text-white">Discover Your Perfect Drive</h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Tag className="h-4 sm:h-5 w-4 sm:w-5 text-blue-200" />
                </div>
                <Input
                  placeholder="Keywords"
                  className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl border-none bg-white/10 pl-10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              <div className="flex space-x-2 sm:space-x-3">
                <div className="relative flex-grow">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-blue-200" />
                  </div>
                  <Input
                    placeholder="Postcode"
                    className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl border-none bg-white/10 pl-10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 sm:h-12 w-[120px] sm:w-[150px] justify-start rounded-xl sm:rounded-2xl border-none bg-white/10 text-left text-sm text-white ring-1 ring-inset ring-white/20"
                      >
                        <Sliders className="h-4 sm:h-5 w-4 sm:w-5 text-blue-200 mr-2" />
                        {selectedDropdownCategory || "Categories"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[120px] sm:w-[150px] rounded-xl sm:rounded-2xl">
                      {categories.map((category) => (
                        <DropdownMenuItem
                          key={category}
                          onSelect={() => setSelectedDropdownCategory(selectedDropdownCategory === category ? null : category)}
                          className={`cursor-pointer text-sm ${
                            selectedDropdownCategory === category ? "bg-blue-100 font-semibold text-blue-800" : ""
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
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/5 p-4 sm:p-6 text-white lg:rounded-l-none">
                <div className="flex flex-col items-center">
                  <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-1 sm:gap-2">
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-red-400 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-blue-500 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-red-400 rounded-full"></div>
                  </div>
                  <h1 className="mb-3 sm:mb-4 text-center text-3xl sm:text-4xl md:text-5xl font-bold uppercase leading-tight drop-shadow-lg">
                    WELCOME TO GB TRADER
                  </h1>
                  <div className="mb-6 sm:mb-8 grid grid-cols-3 gap-1 sm:gap-2">
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-blue-500 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-red-400 rounded-full"></div>
                    <div className="h-1.5 sm:h-2 w-6 sm:w-8 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="w-full flex justify-center select-none">
                    <div
                      ref={carouselRef}
                      className={`relative w-[220px] h-[48px] overflow-visible ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{ touchAction: 'pan-y', userSelect: isDragging ? 'none' : 'auto' }}
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={handleDragStart}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                    >
                      {/* Carousel foreshadow: prev, current, next */}
                      <div
                        className={`flex w-[660px] ${!isDragging ? 'transition-transform duration-500' : ''}`}
                        style={{
                          transform: `translateX(calc(-220px + ${dragOffset}px))`,
                        }}
                      >
                        {/* Previous bubble */}
                        <div className={`w-[220px] flex-shrink-0 items-center transition-all duration-300 ${isDragging ? 'opacity-90 scale-100 blur-0 z-0' : 'opacity-40 scale-90 blur-sm z-0'}`} style={{display: 'flex'}}>
                          <Button
                            className={`w-[220px] text-center whitespace-nowrap rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold text-white border border-white/30 transition-all duration-200`}
                            disabled
                          >
                            {vehicleTypes[(carouselIndex - 1 + vehicleTypes.length) % vehicleTypes.length]}
                          </Button>
                        </div>
                        {/* Current bubble */}
                        <div className="w-[220px] flex-shrink-0 items-center z-10" style={{display: 'flex', justifyContent: 'center'}}>
                          <Button
                            className={`w-[220px] text-center whitespace-nowrap rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold text-white shadow-md hover:bg-white/30 border border-white/30 transition-all duration-200`}
                            onClick={() => handleButtonClick(carouselIndex)}
                          >
                            {vehicleTypes[carouselIndex]}
                          </Button>
                        </div>
                        {/* Next bubble */}
                        <div className={`w-[220px] flex-shrink-0 items-center transition-all duration-300 ${isDragging ? 'opacity-90 scale-100 blur-0 z-0' : 'opacity-40 scale-90 blur-sm z-0'}`} style={{display: 'flex'}}>
                          <Button
                            className={`w-[220px] text-center whitespace-nowrap rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold text-white border border-white/30 transition-all duration-200`}
                            disabled
                          >
                            {vehicleTypes[(carouselIndex + 1) % vehicleTypes.length]}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* Add this to the bottom of the file or in your global CSS for scrollbar hiding */
/*
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
*/
