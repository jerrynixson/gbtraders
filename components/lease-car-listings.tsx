"use client";

import { useEffect, useState } from "react"
import { VehicleSummary } from "@/types/vehicles"
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository"
import { Carousel } from "@/components/ui/carousel"
import { VehicleCard } from "./vehicle-card"

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

export function LeaseCarListings() {
  const [leaseCars, setLeaseCars] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaseCars = async () => {
      try {
        const vehicleRepo = new VehicleRepository();
        const result = await vehicleRepo.searchVehicles(
          { type: 'used-car' },
          { page: 1, limit: 4 }
        );
        setLeaseCars(result.items);
      } catch (error) {
        console.error('Error fetching lease cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseCars();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-gray-50" aria-labelledby="lease-cars-heading">
        <div className="container mx-auto px-4">
          <h2 id="lease-cars-heading" className="text-2xl font-bold mb-6 text-center">
            Lease Deals
          </h2>
          <LoadingSkeleton />
        </div>
      </section>
    );
  }

  return (
    <Carousel
      items={leaseCars}
      renderItem={(car) => (
        <VehicleCard
          key={car.id}
          vehicle={car}
          view="grid"
        />
      )}
      title="Lease Deals"
      viewMoreLink="/search?type=used-car"
      autoScroll={true}
    />
  );
}