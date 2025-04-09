import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { ChevronRight, MapPin, Star, Phone, Clock } from "lucide-react"

type GarageCardProps = {
  name: string
  location: string
  image: string
  rating: number
  specialties: string[]
  address: string
  phone: string
  openingHours: string
}

function GarageCard({
  name,
  location,
  image,
  rating,
  specialties,
  address,
  phone,
  openingHours,
}: GarageCardProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="relative">
        <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded flex items-center">
          <MapPin className="h-3 w-3 mr-1" /> {location}
        </span>
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{name}</h3>
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">{rating}/5</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {specialties.map((specialty, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {specialty}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-600 mb-2">
          <p className="mb-1">{address}</p>
          <div className="flex items-center">
            <Phone className="h-3 w-3 mr-1" /> {phone}
          </div>
          <div className="flex items-center mt-1">
            <Clock className="h-3 w-3 mr-1" /> {openingHours}
          </div>
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90">Contact garage</Button>
      </div>
    </div>
  )
}

export function CarListings() {
  const garages = [
    {
      name: "AMG Motors",
      location: "Birmingham",
      image: "/garages/garage1.jpg",
      rating: 4.8,
      specialties: ["Van Repairs", "MOT", "Servicing", "Diagnostics"],
      address: "123 Coventry Road, Birmingham B12 0JX",
      phone: "0121 123 4567",
      openingHours: "Mon-Fri: 8am-6pm, Sat: 9am-1pm"
    },
    {
      name: "S Motors",
      location: "London",
      image: "/garages/garage2.jpg",
      rating: 4.6,
      specialties: ["Commercial Vehicles", "Electrical Repairs", "Bodywork"],
      address: "45 East London Way, London E14 9PP",
      phone: "020 7890 1234",
      openingHours: "Mon-Fri: 7:30am-6:30pm, Sat: 8am-2pm"
    }
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured Garages</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {garages.map((garage, index) => (
            <GarageCard key={index} {...garage} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link href="#" className="flex items-center text-sm text-primary">
            View more garages <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}