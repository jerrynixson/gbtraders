import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight, MapPin, Star, Phone, Clock } from "lucide-react"

type GarageCardProps = {
  id: string
  name: string
  location: string
  image: string
  rating: number
  specialties: string[]
  address: string
  phone: string
  openingHours: string
}

export function GarageCard({
  id,
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
    <Link href={`/categories/garages/${id}`} className="block group cursor-pointer">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all hover:shadow-lg">
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={400}
            height={250}
            className="w-full h-48 object-contain bg-white"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <span className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {location}
            </span>
          </div>
          <div className="flex items-center mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-2">{rating}/5</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {specialties.map((specialty, index) => (
              <span key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                {specialty}
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-600 space-y-1.5 mb-4">
            <p className="truncate">{address}</p>
            <p className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {phone}
            </p>
            <p className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {openingHours}
            </p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white pointer-events-none">
            Contact garage
          </Button>
        </div>
      </div>
    </Link>
  )
}

export function CarListings() {
  const garages = [
    {
      id: "amg-motors",
      name: "AMG Motors",
      location: "Birmingham",
      image: "/garages/garage1.jpg",
      rating: 4.8,
      specialties: ["Van Repairs", "MOT", "Servicing"],
      address: "123 Coventry Road, Birmingham B12 0JX",
      phone: "0121 123 4567",
      openingHours: "Mon-Fri: 8am-6pm, Sat: 9am-1pm"
    },
    {
      id: "s-motors",
      name: "S Motors",
      location: "London",
      image: "/garages/garage2.jpg",
      rating: 4.6,
      specialties: ["Commercial Vehicles", "Electrical Repairs"],
      address: "45 East London Way, London E14 9PP",
      phone: "020 7890 1234",
      openingHours: "Mon-Fri: 7:30am-6:30pm"
    },
    {
      id: "city-auto-services",
      name: "City Auto Services",
      location: "Manchester",
      image: "/garages/garage3.jpg",
      rating: 4.7,
      specialties: ["General Repairs", "Tire Service"],
      address: "78 Manchester Road, Manchester M1 2AB",
      phone: "0161 456 7890",
      openingHours: "Mon-Fri: 8am-5:30pm"
    },
    {
      id: "elite-motors",
      name: "Elite Motors",
      location: "Leeds",
      image: "/garages/garage4.jpg",
      rating: 4.9,
      specialties: ["Luxury Cars", "Performance Tuning"],
      address: "15 Leeds Business Park, Leeds LS1 2AB",
      phone: "0113 789 0123",
      openingHours: "Mon-Fri: 8:30am-6pm"
    }
  ]

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-8">Featured Garages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {garages.map((garage) => (
            <GarageCard key={garage.id} {...garage} />
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <Link
            href="/search-garages"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            View more garages <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}