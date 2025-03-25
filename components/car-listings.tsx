import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { ChevronRight } from "lucide-react"

type CarCardProps = {
  tag: string
  image: string
  price: string
  initialPayment: string
  contractLength: string
  milesPerYear: string
  make: string
  model: string
  description: string
}

function CarCard({
  tag,
  image,
  price,
  initialPayment,
  contractLength,
  milesPerYear,
  make,
  model,
  description,
}: CarCardProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="relative">
        <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">{tag}</span>
        <Image
          src={image || "/placeholder.svg"}
          alt={`${make} ${model}`}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">From</div>
        <div className="flex items-baseline mb-1">
          <span className="text-xl font-bold">{price}</span>
          <span className="text-xs text-gray-500 ml-1">Per month inc. VAT</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          {initialPayment} initial payment
          <br />
          {contractLength} month contract
          <br />
          {milesPerYear} miles p.a.
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90 mb-3">View deal</Button>
        <h3 className="font-bold">
          {make} {model}
        </h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}

export function CarListings() {
  const cars = [
    {
      tag: "PCP",
      image: "/cars/car1.jpg",
      price: "£166",
      initialPayment: "£1,987",
      contractLength: "48",
      milesPerYear: "8,000",
      make: "Peugeot",
      model: "208",
      description: "1.2 PureTech Allure E-go 6 (s/s) 5dr",
    },
    {
      tag: "PCP",
      image: "/cars/car2.jpg",
      price: "£235",
      initialPayment: "£2,851",
      contractLength: "24",
      milesPerYear: "5,000",
      make: "Renault",
      model: "Scenic E-Tech",
      description: "long range 87kWh techno Auto 5dr (220kW Charger)",
    },
    {
      tag: "PCP",
      image: "/cars/car3.jpg",
      price: "£293",
      initialPayment: "£3,516",
      contractLength: "24",
      milesPerYear: "5,000",
      make: "Volkswagen",
      model: "ID.7",
      description: "Pro S 86kWh Match Fastback Auto 5dr",
    },
    {
      tag: "PCP",
      image: "/cars/car4.jpg",
      price: "£243",
      initialPayment: "£2,909",
      contractLength: "24",
      milesPerYear: "5,000",
      make: "CUPRA",
      model: "Born",
      description: "e-Boost 59kWh V1 Auto 5dr",
    },
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* <div className="flex items-center mb-6">
          <span className="mr-2 text-sm">Sorted by</span>
          <Select defaultValue="new" className="w-40">
            <option value="new">New</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </Select>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {cars.map((car, index) => (
            <CarCard key={index} {...car} />
          ))}

          {/* Next button */}
          <Button variant="ghost" size="icon" className="absolute -right-12 top-1/2 transform -translate-y-1/2">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-8">
          <Link href="#" className="flex items-center text-sm text-primary">
            View more deals <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}

