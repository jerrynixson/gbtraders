import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard } from "@/components/vehicle-card"

export function LeaseElectricVehicleListings() {
  const leaseElectricVehicles = [
    {
      id: 1,
      title: "Tesla Model 3 Long Range AWD",
      price: 549,
      monthlyPrice: 549,
      image: "/electric-vehicles/lease-ev1.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Electric",
      transmission: "Automatic",
      isHighlighted: false,
    },
    {
      id: 2,
      title: "BMW i4 eDrive40 M Sport",
      price: 649,
      monthlyPrice: 649,
      image: "/electric-vehicles/lease-ev2.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Electric",
      transmission: "Automatic",
      isHighlighted: false,
    },
    {
      id: 3,
      title: "Audi Q4 e-tron 50 quattro S line",
      price: 599,
      monthlyPrice: 599,
      image: "/electric-vehicles/lease-ev3.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Electric",
      transmission: "Automatic",
      isHighlighted: false,
    },
    {
      id: 4,
      title: "Mercedes-Benz EQS 450+ AMG Line",
      price: 729,
      monthlyPrice: 729,
      image: "/electric-vehicles/lease-ev4.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Electric",
      transmission: "Automatic",
      isHighlighted: false,
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Lease Electric Vehicles</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {leaseElectricVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} {...vehicle} />
          ))}

          {/* Next button */}
          <Button variant="ghost" size="icon" className="absolute -right-12 top-1/2 transform -translate-y-1/2">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          <Link href="#" className="flex items-center text-sm text-primary">
            View more lease deals <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
} 