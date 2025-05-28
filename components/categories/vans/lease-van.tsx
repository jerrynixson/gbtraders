import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard, Vehicle } from "@/components/vehicle-card"

export function LeaseVanListings() {
  const vans: Vehicle[] = [
    {
      id: 1,
      title: "Mercedes-Benz Sprinter 313 CDI",
      price: 399,
      monthlyPrice: 399,
      image: "/vans/van1.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "Mercedes-Benz",
      model: "Sprinter 313 CDI",
      description: "Premium large van with excellent load capacity",
      initialPayment: "£4,788",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 2,
      title: "Ford Transit Custom 280",
      price: 349,
      monthlyPrice: 349,
      image: "/vans/van2.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "Ford",
      model: "Transit Custom 280",
      description: "Versatile medium van with modern features",
      initialPayment: "£4,188",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 3,
      title: "Volkswagen Transporter T6.1",
      price: 379,
      monthlyPrice: 379,
      image: "/vans/van3.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "Volkswagen",
      model: "Transporter T6.1",
      description: "Premium medium van with advanced technology",
      initialPayment: "£4,548",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 4,
      title: "Renault Trafic 150",
      price: 329,
      monthlyPrice: 329,
      image: "/vans/van4.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "Renault",
      model: "Trafic 150",
      description: "Efficient medium van with practical design",
      initialPayment: "£3,948",
      contractLength: "48",
      milesPerYear: "0",
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Lease a Brand New Van</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {vans.map((vehicle) => (
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