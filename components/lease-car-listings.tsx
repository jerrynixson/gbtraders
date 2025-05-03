import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard, Vehicle } from "./vehicle-card"

const leaseCars: Vehicle[] = [
  {
    id: 5,
    image: "/cars/lease1.jpg",
    title: "Audi A3",
    price: 199,
    monthlyPrice: 199,
    year: "2023",
    mileage: "8,000",
    distance: "5 miles",
    location: "London",
    tag: "Lease",
    make: "Audi",
    model: "A3",
    description: "35 TFSI Sport 5dr S Tronic",
    initialPayment: "£1,194",
    contractLength: "36",
    milesPerYear: "8,000",
  },
  {
    id: 6,
    image: "/cars/lease2.jpg",
    title: "BMW 1 Series",
    price: 249,
    monthlyPrice: 249,
    year: "2023",
    mileage: "8,000",
    distance: "5 miles",
    location: "London",
    tag: "Lease",
    make: "BMW",
    model: "1 Series",
    description: "118i M Sport 5dr Step Auto",
    initialPayment: "£1,494",
    contractLength: "36",
    milesPerYear: "8,000",
  },
  {
    id: 7,
    image: "/cars/lease3.jpg",
    title: "Mercedes A-Class",
    price: 299,
    monthlyPrice: 299,
    year: "2023",
    mileage: "8,000",
    distance: "5 miles",
    location: "London",
    tag: "Lease",
    make: "Mercedes",
    model: "A-Class",
    description: "A180 AMG Line 5dr Auto",
    initialPayment: "£1,794",
    contractLength: "36",
    milesPerYear: "8,000",
  },
  {
    id: 8,
    image: "/cars/lease4.jpg",
    title: "Volkswagen Golf",
    price: 279,
    monthlyPrice: 279,
    year: "2023",
    mileage: "8,000",
    distance: "5 miles",
    location: "London",
    tag: "Lease",
    make: "Volkswagen",
    model: "Golf",
    description: "1.5 TSI Life 5dr DSG",
    initialPayment: "£1,674",
    contractLength: "36",
    milesPerYear: "8,000",
  },
]

export function LeaseCarListings() {
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
              id={car.id}
              image={car.image}
              title={car.title}
              price={car.price}
              monthlyPrice={car.monthlyPrice}
              year={car.year}
              mileage={car.mileage}
              distance={car.distance}
              location={car.location}
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
            href="#" 
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