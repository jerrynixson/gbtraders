import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard } from "@/components/vehicle-card"

export function CarListings() {
  const cars = [
    {
      id: "1",
      type: "car" as const,
      make: "BMW",
      model: "3 Series 320d M Sport",
      year: 2023,
      price: 299,
      monthlyPrice: 299,
      mileage: 0,
      fuel: "diesel" as const,
      transmission: "automatic" as const,
      color: "Blue",
      registrationNumber: "ABC123",
      location: {
        address: "123 Main St",
        city: "London",
        country: "UK"
      },
      mainImage: "/cars/car1.jpg",
      imageUrls: ["/cars/car1.jpg"]
    },
    {
      id: "2",
      type: "car" as const,
      make: "Mercedes-Benz",
      model: "C-Class C220d AMG Line",
      year: 2023,
      price: 349,
      monthlyPrice: 349,
      mileage: 0,
      fuel: "diesel" as const,
      transmission: "automatic" as const,
      color: "Black",
      registrationNumber: "DEF456",
      location: {
        address: "456 Main St",
        city: "London",
        country: "UK"
      },
      mainImage: "/cars/car2.jpg",
      imageUrls: ["/cars/car2.jpg"]
    },
    {
      id: "3",
      type: "car" as const,
      make: "Audi",
      model: "A4 40 TDI S line",
      year: 2023,
      price: 329,
      monthlyPrice: 329,
      mileage: 0,
      fuel: "diesel" as const,
      transmission: "automatic" as const,
      color: "White",
      registrationNumber: "GHI789",
      location: {
        address: "789 Main St",
        city: "London",
        country: "UK"
      },
      mainImage: "/cars/car3.jpg",
      imageUrls: ["/cars/car3.jpg"]
    },
    {
      id: "4",
      type: "car" as const,
      make: "Volkswagen",
      model: "Golf 2.0 TDI R-Line",
      year: 2023,
      price: 279,
      monthlyPrice: 279,
      mileage: 0,
      fuel: "diesel" as const,
      transmission: "automatic" as const,
      color: "Silver",
      registrationNumber: "JKL012",
      location: {
        address: "012 Main St",
        city: "London",
        country: "UK"
      },
      mainImage: "/cars/car4.jpg",
      imageUrls: ["/cars/car4.jpg"]
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Cars for Sale</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 relative">
          {cars.map((vehicle) => (
            <div key={vehicle.id}>
              <VehicleCard vehicle={vehicle} view="grid" />
            </div>
          ))}

          {/* Next button */}
          <Button variant="ghost" size="icon" className="absolute -right-12 top-1/2 transform -translate-y-1/2">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-8">
          <Link href="/vehicles">
            <Button variant="outline" className="flex items-center">
              View more cars <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 