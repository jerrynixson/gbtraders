"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Phone, MapPin, Star, Info } from "lucide-react"
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from "next/link"

// DealerData type (copied from app/categories/dealers/page.tsx for local use)
type DealerData = {
  id: string;
  businessName: string;
  dealerBannerUrl: string;
  dealerLogoUrl?: string;
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  location: {
    addressLines: string[];
    lat: number;
    long: number;
  };
  businessHours: {
    mondayToFriday?: string;
    saturday?: string;
    sunday?: string;
  };
  description: string;
  specialties: string[];
  rating: number;
  socialMedia: string[];
};

interface CarRentalBannerProps {
  autoScrollInterval?: number // Optional prop to customize auto-scroll interval
}

const CarRentalBannerMinimal: React.FC<CarRentalBannerProps> = ({
  autoScrollInterval = 5000,
}) => {
  const [banners, setBanners] = useState<DealerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [activeTab, setActiveTab] = useState<'info' | 'contact'>('info')
  const [isAnimating, setIsAnimating] = useState(false)

  // Fetch dealer data from Firestore
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true)
        setError(null)
        const dealersRef = collection(db, 'dealers')
        const q = query(dealersRef)
        const querySnapshot = await getDocs(q)
        const dealersData: DealerData[] = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            businessName: data.businessName || '',
            dealerBannerUrl: data.dealerBannerUrl || '',
            dealerLogoUrl: data.dealerLogoUrl || undefined,
            contact: data.contact || {},
            location: data.location || { addressLines: [], lat: 0, long: 0 },
            businessHours: data.businessHours || {},
            description: data.description || '',
            specialties: data.specialties || [],
            rating: data.rating || 0,
            socialMedia: data.socialMedia || []
          }
        })
        setBanners(dealersData)
      } catch (err) {
        setError('Failed to load dealer banners')
      } finally {
        setLoading(false)
      }
    }
    fetchDealers()
  }, [])

  // Handle next banner
  const nextBanner = () => {
    if (isAnimating || banners.length === 0) return
    setIsAnimating(true)
    setCurrentBanner((prev) => (prev + 1) % banners.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Handle previous banner
  const prevBanner = () => {
    if (isAnimating || banners.length === 0) return
    setIsAnimating(true)
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Auto-scroll effect (consistent every 5 seconds)
  useEffect(() => {
    if (banners.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, autoScrollInterval);
    return () => clearInterval(intervalId);
  }, [autoScrollInterval, banners.length]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <span className="text-gray-500 dark:text-gray-300">Loading dealer banners...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <span className="text-red-500">{error}</span>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <span className="text-gray-500 dark:text-gray-300">No dealer banners available.</span>
      </div>
    )
  }

  const banner = banners[currentBanner]

  return (
    <div className="relative w-full max-w-[85rem] mx-auto">
      {/* Banner Container */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
        {/* Current Banner */}
        <div key={banner.id} className="grid grid-cols-1 md:grid-cols-2 h-auto">
          {/* Image Section */}
          <div className="relative h-64 md:h-auto overflow-hidden rounded-2xl">
            <Image
              src={banner.dealerBannerUrl || "/placeholder.svg"}
              alt={banner.businessName}
              fill
              className="object-cover"
              priority
            />
            {/* Dealer Logo inside banner image */}
            <div className="absolute top-4 left-4 z-20">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                <Image
                  src={banner.dealerLogoUrl || "/placeholder-logo.png"}
                  alt={banner.businessName + ' logo'}
                  width={120}
                  height={120}
                  className="object-contain w-32 h-32"
                />
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
              {banner.businessName}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 flex flex-col">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {banner.businessName}
              </h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{banner.location.addressLines[0]}</span>
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
            <div className="flex-grow h-[140px] flex flex-col justify-center">
              {activeTab === "info" && (
                <div className="flex flex-col justify-center h-full gap-2 text-base leading-snug">
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-1">
                    {banner.description}
                  </p>
                  {banner.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-xs text-gray-500 mr-1">Specialties:</span>
                      {banner.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-0.5 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "contact" && (
                <div className="flex flex-col justify-center h-full gap-2 text-base leading-snug">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <a
                      href={`tel:${banner.contact.phone?.replace(/[^0-9]/g, "")}`}
                      className="text-gray-900 dark:text-white font-medium hover:underline text-sm"
                    >
                      {banner.contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white text-sm truncate">
                      {banner.location.addressLines.filter(line => line && line.trim()).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white text-sm">
                      {banner.businessName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Link
                href={`/categories/dealers/${banner.id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 
                          text-white transition-colors duration-300 
                          flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                View Dealer Profile
              </Link>
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
