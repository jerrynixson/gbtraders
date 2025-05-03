import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard, Vehicle } from "@/components/vehicle-card"

export function CaravanListings() {
  const caravans: Vehicle[] = [
    {
      id: 1,
      title: "Swift Challenger",
      price: 166,
      monthlyPrice: 166,
      image: "/caravans/caravan1.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "N/A",
      transmission: "N/A",
      tag: "Caravan",
      make: "Swift",
      model: "Challenger",
      description: "Luxury touring caravan with modern amenities",
      initialPayment: "£1,992",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 2,
      title: "Bailey Unicorn",
      price: 235,
      monthlyPrice: 235,
      image: "/caravans/caravan2.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "N/A",
      transmission: "N/A",
      tag: "Caravan",
      make: "Bailey",
      model: "Unicorn",
      description: "Premium touring caravan with spacious interior",
      initialPayment: "£2,820",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 3,
      title: "Elddis Avante",
      price: 293,
      monthlyPrice: 293,
      image: "/caravans/caravan3.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "N/A",
      transmission: "N/A",
      tag: "Caravan",
      make: "Elddis",
      model: "Avante",
      description: "Modern touring caravan with innovative features",
      initialPayment: "£3,516",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 4,
      title: "Lunar Clubman",
      price: 243,
      monthlyPrice: 243,
      image: "/caravans/caravan4.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "N/A",
      transmission: "N/A",
      tag: "Caravan",
      make: "Lunar",
      model: "Clubman",
      description: "Elegant touring caravan with premium finishes",
      initialPayment: "£2,916",
      contractLength: "48",
      milesPerYear: "0",
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Caravans for Sale</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {caravans.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              id={vehicle.id}
              image={vehicle.image}
              title={vehicle.title}
              price={vehicle.price}
              monthlyPrice={vehicle.monthlyPrice}
              year={vehicle.year}
              mileage={vehicle.mileage}
              fuel={vehicle.fuel}
              transmission={vehicle.transmission}
              distance={vehicle.distance}
              location={vehicle.location}
              view="grid"
            />
          ))}

          {/* Next button */}
          <Button variant="ghost" size="icon" className="absolute -right-12 top-1/2 transform -translate-y-1/2">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          <Link href="#" className="flex items-center text-sm text-primary">
            View more caravans <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}