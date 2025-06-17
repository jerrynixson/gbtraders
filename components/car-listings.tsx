"use client";

import { useEffect, useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository"

export function CarListings() {
  const [featuredCars, setFeaturedCars] = useState<VehicleSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const vehicleRepo = new VehicleRepository()
        const result = await vehicleRepo.searchVehicles(
          { type: 'car' },
          { page: 1, limit: 4 }
        )
        setFeaturedCars(result.items)
      } catch (error) {
        console.error("Error fetching featured cars:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedCars()
  }, [])

  if (loading) {
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Featured Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Carousel
      items={featuredCars}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Featured Cars"
      viewMoreLink="/cars"
      autoScroll={true}
    />
  );
}