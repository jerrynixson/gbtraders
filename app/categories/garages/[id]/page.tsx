import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GoogleMapComponent } from "@/components/ui/google-map"

// Mock data for demonstration
const garage = {
  name: "AMG Mechanical engineering",
  address: "B12 0DF, Birmingham, West Midlands, England, United Kingdom",
  phone: "+44 121 446 5777",
  image: "/garages/garage1.jpg",
  price: "£0.00",
  description:
    "The mechanics at our shop have over 60 years of experience between them. They are dedicated to providing high-quality repairs to keep you safe and happy.",
  services: [
    { name: "MOT", available: false },
    { name: "Body Repair", available: false },
    { name: "Parts", available: false },
    { name: "Services", available: true },
    { name: "Automatic Transmission", available: true },
    { name: "Diagnostic", available: true },
    { name: "Tyre Change", available: false },
    { name: "Wheel Alignment", available: false },
    { name: "Mechanical Repairs", available: true },
  ],
  rating: 4.8,
  specialties: ["MOT", "Servicing", "Repairs"],
  openingHours: "Mon-Fri: 8am-6pm",
};

const relatedGarages = [
  {
    name: "S Motors",
    location: "Birmingham",
    image: "/garages/garage2.jpg",
    rating: 4.6,
    specialties: ["Commercial Vehicles", "Electrical Repairs"],
    address: "B12 9AZ, Birmingham, West Midlands, England, United Kingdom",
    phone: "0121 123 4567",
    openingHours: "Mon-Fri: 8am-6pm, Sat: 9am-1pm",
  },
  {
    name: "Road end tyer exchanges",
    location: "Oldbury",
    image: "/garages/garage3.jpg",
    rating: 4.5,
    specialties: ["Tyre Service", "Wheel Alignment"],
    address: "B68 8SR, Oldbury, West Midlands, England, United Kingdom",
    phone: "0121 234 5678",
    openingHours: "Mon-Fri: 8am-5:30pm",
  },
  {
    name: "GT Autos",
    location: "Birmingham",
    image: "/garages/garage4.jpg",
    rating: 4.7,
    specialties: ["MOT", "General Repairs"],
    address: "B9 5HV, Birmingham, West Midlands, England, United Kingdom",
    phone: "0121 753 2012",
    openingHours: "Mon-Fri: 8am-6pm, Sat: 9am-1pm",
  },
];

export default function GarageInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Main Info */}
        <div className="flex-1 bg-white/70 rounded-3xl shadow-xl p-8">
          <div className="w-full h-72 relative mb-6">
            <Image
              src={garage.image}
              alt={garage.name}
              fill
              className="object-contain bg-white rounded-2xl"
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{garage.name}</h1>
          <div className="flex items-center text-blue-700 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            {garage.address}
          </div>
          <div className="flex items-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(garage.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
              />
            ))}
            <span className="ml-2 text-blue-900 font-semibold">{garage.rating}/5</span>
          </div>
          <div className="mb-4">
            <h2 className="font-semibold text-blue-800 mb-2">Services</h2>
            <ul className="flex flex-wrap gap-2">
              {garage.services.map((s, i) => (
                <li
                  key={i}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${s.available ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-400 line-through"}`}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-gray-700 mb-6">{garage.description}</p>
        </div>
        {/* Right: Contact & Map */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
            <Button className="w-full mb-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
              <Phone className="mr-2" /> Call {garage.phone}
            </Button>
            <Button variant="outline" className="w-full mb-3">
              Reply to Listing
            </Button>
            <div className="text-2xl font-bold text-blue-900 mb-2">{garage.price}</div>
          </div>
          <div className="bg-white/80 rounded-3xl shadow-lg p-4">
            <div className="w-full h-48 rounded-2xl overflow-hidden">
              <GoogleMapComponent 
                center={{ lat: 52.4862, lng: -1.8904 }} // Birmingham coordinates
                zoom={13}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Related Listings */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Related Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedGarages.map((garage, i) => (
            <div key={i} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 relative">
                <Image src={garage.image} alt={garage.name} fill className="object-cover rounded-t-xl" style={{ objectFit: "cover" }} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{garage.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {garage.location}
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < Math.round(garage.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                  <span className="ml-2 text-gray-700 font-medium">{garage.rating}/5</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {garage.specialties.map((spec, k) => (
                    <span key={k} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{spec}</span>
                  ))}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Address:</span> {garage.address}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Phone:</span> {garage.phone}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Hours:</span> {garage.openingHours}
                </div>
                <div className="flex justify-end mt-auto">
                  <Link href="#">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
} 