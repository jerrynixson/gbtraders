import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard, Vehicle } from "./vehicle-card"

const cars: Vehicle[] = [
  {
    id: 1,
    image: "/cars/car1.jpg",
    title: "Peugeot 208",
    price: 166,
    monthlyPrice: 166,
    year: "2023",
    mileage: "8,000",
    distance: "5 miles",
    location: "London",
    tag: "PCP",
    make: "Peugeot",
    model: "208",
    description: "1.2 PureTech Allure E-go 6 (s/s) 5dr",
    initialPayment: "£1,987",
    contractLength: "48",
    milesPerYear: "8,000",
  },
  {
    id: 2,
    image: "/cars/car2.jpg",
    title: "Renault Scenic E-Tech",
    price: 235,
    monthlyPrice: 235,
    year: "2023",
    mileage: "5,000",
    distance: "5 miles",
    location: "London",
    tag: "PCP",
    make: "Renault",
    model: "Scenic E-Tech",
    description: "long range 87kWh techno Auto 5dr (220kW Charger)",
    initialPayment: "£2,851",
    contractLength: "24",
    milesPerYear: "5,000",
  },
  {
    id: 3,
    image: "/cars/car3.jpg",
    title: "Volkswagen ID.7",
    price: 293,
    monthlyPrice: 293,
    year: "2023",
    mileage: "5,000",
    distance: "5 miles",
    location: "London",
    tag: "PCP",
    make: "Volkswagen",
    model: "ID.7",
    description: "Pro S 86kWh Match Fastback Auto 5dr",
    initialPayment: "£3,516",
    contractLength: "24",
    milesPerYear: "5,000",
  },
  {
    id: 4,
    image: "/cars/car4.jpg",
    title: "CUPRA Born",
    price: 243,
    monthlyPrice: 243,
    year: "2023",
    mileage: "5,000",
    distance: "5 miles",
    location: "London",
    tag: "PCP",
    make: "CUPRA",
    model: "Born",
    description: "e-Boost 59kWh V1 Auto 5dr",
    initialPayment: "£2,909",
    contractLength: "24",
    milesPerYear: "5,000",
  },
]

export function CarListings() {
  return (
    <section className="py-12" aria-labelledby="featured-cars-heading">
      <div className="container mx-auto px-4">
        <h2 id="featured-cars-heading" className="text-2xl font-bold mb-6 text-center">
          Featured Cars
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {cars.map((car) => (
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
            aria-label="View more car deals"
          >
            View more deals <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}