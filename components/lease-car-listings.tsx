"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard } from "./vehicle-card"
import { useEffect, useState } from "react"
import { VehicleSummary } from "@/types/vehicles"
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository"

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
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50" aria-labelledby="lease-cars-heading">
      <div className="container mx-auto px-4">
        <h2 id="lease-cars-heading" className="text-2xl font-bold mb-6 text-center">
          Lease Deals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {leaseCars.map((car) => (
            <VehicleCard
              key={car.id}
              vehicle={car}
              view="grid"
            />
          ))}

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden lg:block"
            aria-label="Next page"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-8">
          <Link 
            href="/search?type=used-car" 
            className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
            aria-label="View more lease deals"
          >
            View more lease deals <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}