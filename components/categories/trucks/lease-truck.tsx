import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { VehicleCard, Vehicle } from "@/components/vehicle-card"

export function LeaseTruckListings() {
  const trucks: Vehicle[] = [
    {
      id: 1,
      title: "Mercedes-Benz Actros 1845",
      price: 1299,
      monthlyPrice: 1299,
      image: "/trucks/truck1.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "Mercedes-Benz",
      model: "Actros 1845",
      description: "Premium heavy-duty truck with advanced safety features",
      initialPayment: "£15,588",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 2,
      title: "Volvo FH 460",
      price: 1499,
      monthlyPrice: 1499,
      image: "/trucks/truck2.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "Volvo",
      model: "FH 460",
      description: "High-performance truck with fuel-efficient engine",
      initialPayment: "£17,988",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 3,
      title: "Scania R 450",
      price: 1399,
      monthlyPrice: 1399,
      image: "/trucks/truck3.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "Scania",
      model: "R 450",
      description: "Reliable truck with excellent fuel economy",
      initialPayment: "£16,788",
      contractLength: "48",
      milesPerYear: "0",
    },
    {
      id: 4,
      title: "DAF XF 450",
      price: 1199,
      monthlyPrice: 1199,
      image: "/trucks/truck4.jpg",
      distance: "0 miles away",
      location: "GB Traders",
      year: "2023",
      mileage: "0",
      fuel: "Diesel",
      transmission: "Automatic",
      tag: "Lease",
      make: "DAF",
      model: "XF 450",
      description: "Efficient truck with comfortable cabin",
      initialPayment: "£14,388",
      contractLength: "48",
      milesPerYear: "0",
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Lease a Brand New Truck</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {trucks.map((vehicle) => (
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