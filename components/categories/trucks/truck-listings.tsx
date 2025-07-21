"use client"

import { useEffect, useState } from "react"
import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository"
import { Skeleton } from "@/components/ui/skeleton"

export function TruckListings() {
  const [trucks, setTrucks] = useState<VehicleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        setLoading(true)
        const vehicleRepo = new VehicleRepository()
        const result = await vehicleRepo.searchVehicles(
          { type: "truck" },
          { limit: 10 },
        )
        setTrucks(result.items)
      } catch (err) {
        setError("Failed to fetch trucks. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrucks()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Trucks</h2>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (trucks.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Trucks</h2>
        <p>No trucks available at the moment. Please check back later.</p>
      </div>
    )
  }

  return (
    <Carousel
      items={trucks}
      renderItem={vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} view="grid" />
      )}
      title="Trucks"
      viewMoreLink="/categories/trucks"
      autoScroll
    />
  )
} 