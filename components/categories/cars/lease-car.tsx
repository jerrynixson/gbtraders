import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard } from "@/components/vehicle-card"

export function LeaseCarListings() {
  const cars = [
    {
      id: 1,
      title: "BMW 3 Series 320d M Sport",
      price: 299,
      monthlyPrice: 299,
      image: "/cars/car1.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Diesel",
      transmission: "Automatic",
      isHighlighted: false,
    },
    {
      id: 2,
      title: "Mercedes-Benz C-Class C220d AMG Line",
      price: 349,
      monthlyPrice: 349,
      image: "/cars/car2.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Diesel",
      transmission: "Automatic",
      isHighlighted: false,
    },
    {
      id: 3,
      title: "Audi A4 40 TDI S line",
      price: 329,
      monthlyPrice: 329,
      image: "/cars/car3.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Diesel",
      transmission: "Automatic",
      isHighlighted: false,
    },
    {
      id: 4,
      title: "Volkswagen Golf 2.0 TDI R-Line",
      price: 279,
      monthlyPrice: 279,
      image: "/cars/car4.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: 2023,
      mileage: 0,
      fuel: "Diesel",
      transmission: "Automatic",
      isHighlighted: false,
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Lease a Brand New Car</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {cars.map((vehicle) => (
            <VehicleCard key={vehicle.id} {...vehicle} />
          ))}

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