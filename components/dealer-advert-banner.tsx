"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Phone, MapPin, Star, Info } from "lucide-react"

// Define the banner data type
export interface BannerData {
  id: number
  vehicle: string
  title: string
  description: string
  detailedDescription: string
  dealerInfo: {
    name: string
    location: string
    rating: number
    specialties: string[]
  }
  contactNumber: string
}

// Props interface for the component
interface CarRentalBannerProps {
  banners?: BannerData[] // Optional prop to allow custom banners
  autoScrollInterval?: number // Optional prop to customize auto-scroll interval
}

// Default banner data
const defaultBannerData: BannerData[] = [
  {
    id: 1,
    vehicle: "/Dealers/dealer1.jpg",
    title: "SPEED INTO SAVINGS!",
    description: "Velocity Motors",
    detailedDescription:
      "At Velocity Motors, we bring you the fastest, most stylish, and performance-packed cars at unmatched prices. Whether you're looking for a muscle car, SUV, or luxury sedan, we've got the perfect ride for you!",
    dealerInfo: {
      name: "Velocity Motors",
      location: "Downtown City Center",
      rating: 4.5,
      specialties: ["Luxury Cars", "SUVs", "Weekend Specials"],
    },
    contactNumber: "234-342-5645",
  },
  {
    id: 2,
    vehicle: "/Dealers/dealer2.jpg",
    title: "BIG CARS. BIGGER DEALS!",
    description: "Titan Auto Hub",
    detailedDescription:
      "Looking for power, durability, and a deal you can't resist? At Titan Auto Hub, we bring you the strongest and most reliable vehicles at the best prices. Whether it's an SUV, truck, or sports car, we make sure you drive away with confidence!",
    dealerInfo: {
      name: "Titan Auto Hub",
      location: "Uptown District",
      rating: 4.8,
      specialties: ["Sports Cars", "Convertibles", "Premium Service"],
    },
    contactNumber: "234-342-5646",
  },
]

const CarRentalBannerMinimal: React.FC<CarRentalBannerProps> = ({
  banners = defaultBannerData,
  autoScrollInterval = 5000,
}) => {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [activeTab, setActiveTab] = useState<"info" | "contact">("info")
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle next banner
  const nextBanner = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentBanner((prev) => (prev + 1) % banners.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Handle previous banner
  const prevBanner = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Auto-scroll effect
  useEffect(() => {
    const intervalId = setInterval(nextBanner, autoScrollInterval)
    return () => clearInterval(intervalId)
  }, [currentBanner, autoScrollInterval])

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Banner Container */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        {/* Current Banner */}
        <div key={banners[currentBanner].id} className="grid grid-cols-1 md:grid-cols-2 h-auto">
          {/* Image Section */}
          <div className="relative h-64 md:h-auto overflow-hidden">
            <Image
              src={banners[currentBanner].vehicle || "/placeholder.svg"}
              alt="Rental Vehicle"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
              {banners[currentBanner].title}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {banners[currentBanner].description}
              </h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{banners[currentBanner].dealerInfo.location}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span>{banners[currentBanner].dealerInfo.rating}</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "info"
                    ? "text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Information
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "contact"
                    ? "text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Contact
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-grow">
              {activeTab === "info" && (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {banners[currentBanner].detailedDescription}
                  </p>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {banners[currentBanner].dealerInfo.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2.5 py-1 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <a
                        href={`tel:${banners[currentBanner].contactNumber.replace(/[^0-9]/g, "")}`}
                        className="text-gray-900 dark:text-white font-medium hover:underline"
                      >
                        {banners[currentBanner].contactNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-900 dark:text-white">{banners[currentBanner].dealerInfo.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dealer</p>
                      <p className="text-gray-900 dark:text-white">{banners[currentBanner].dealerInfo.name}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <a
                href={`tel:${banners[currentBanner].contactNumber.replace(/[^0-9]/g, "")}`}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                          text-white transition-colors duration-300 
                          flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                <Phone size={16} className="mr-2" />
                Contact Dealer
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 
                    text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 
                    bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm 
                    rounded-full p-2 shadow-md z-20"
          aria-label="Previous banner"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 
                    text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 
                    bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 backdrop-blur-sm 
                    rounded-full p-2 shadow-md z-20"
          aria-label="Next banner"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default CarRentalBannerMinimal
