"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Clock, Shield, Wrench, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock data for demonstration
const service = {
  id: "service-1",
  name: "AA Breakdown Service",
  location: "Manchester",
  image: "/breakdown/breakdown1.jpg",
  rating: 4.8,
  services: [
    { name: "Roadside Assistance", available: true },
    { name: "Recovery", available: true },
    { name: "Home Start", available: true },
    { name: "Onward Travel", available: true },
    { name: "Battery Replacement", available: true },
    { name: "Fuel Delivery", available: true },
    { name: "Tyre Change", available: true },
    { name: "Lockout Service", available: true },
  ],
  address: "123 Service Street, Manchester, M1 1AA",
  phone: "0800 123 4567",
  openingHours: "24/7 Emergency Service",
  description: "Professional breakdown and recovery services available 24/7 across the UK. Our team of qualified technicians is ready to assist you with any roadside emergency.",
  coverage: "Nationwide coverage across the United Kingdom",
  responseTime: "Average response time: 30 minutes",
  team: "Fully qualified and experienced technicians",
  vehicles: "All vehicle types covered",
  membership: "No membership required",
};

const relatedServices = [
  {
    id: "service-2",
    name: "RAC Breakdown",
    location: "Manchester",
    image: "/breakdown/breakdown2.jpg",
    rating: 4.6,
    services: ["Roadside Assistance", "Recovery", "Home Start"],
    address: "456 Service Street, Manchester, M2 2BB",
    phone: "0800 234 5678",
    openingHours: "24/7 Emergency Service",
  },
  {
    id: "service-3",
    name: "Green Flag",
    location: "Manchester",
    image: "/breakdown/breakdown3.jpg",
    rating: 4.5,
    services: ["Roadside Assistance", "Recovery", "Onward Travel"],
    address: "789 Service Street, Manchester, M3 3CC",
    phone: "0800 345 6789",
    openingHours: "24/7 Emergency Service",
  },
  {
    id: "service-4",
    name: "Britannia Rescue",
    location: "Manchester",
    image: "/breakdown/breakdown4.jpg",
    rating: 4.7,
    services: ["Roadside Assistance", "Home Start", "Recovery"],
    address: "321 Service Street, Manchester, M4 4DD",
    phone: "0800 456 7890",
    openingHours: "24/7 Emergency Service",
  },
];

export default function ServiceInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Main Info */}
        <div className="flex-1 bg-white/70 rounded-3xl shadow-xl p-8">
          <div className="w-full h-72 relative mb-6">
            <Image
              src={service.image}
              alt={service.name}
              fill
              className="object-contain bg-white rounded-2xl"
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{service.name}</h1>
          <div className="flex items-center text-blue-700 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            {service.address}
          </div>
          <div className="flex items-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(service.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
              />
            ))}
            <span className="ml-2 text-blue-900 font-semibold">{service.rating}/5</span>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-blue-800 mb-2">Services Offered</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {service.services.map((s, i) => (
                <li
                  key={i}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${s.available ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-400 line-through"}`}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-gray-700 mb-6">{service.description}</p>
          
          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">Coverage</h3>
              <p className="text-gray-600">{service.coverage}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">Response Time</h3>
              <p className="text-gray-600">{service.responseTime}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">Team</h3>
              <p className="text-gray-600">{service.team}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">Vehicles</h3>
              <p className="text-gray-600">{service.vehicles}</p>
            </div>
          </div>
        </div>

        {/* Right: Contact & Map */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
            <Button className="w-full mb-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
              <Phone className="mr-2" /> Call {service.phone}
            </Button>
            <Button variant="outline" className="w-full mb-3">
              Request Quote
            </Button>
            <div className="w-full space-y-4 mt-4">
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <span>{service.openingHours}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                <span>{service.membership}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/80 rounded-3xl shadow-lg p-4">
            <div className="w-full h-48 bg-gray-200 rounded-2xl flex items-center justify-center text-blue-400">
              Map Placeholder
            </div>
          </div>
        </div>
      </div>

      {/* Related Services */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Other Services in {service.location}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedServices.map((relatedService) => (
            <div key={relatedService.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 relative">
                <Image src={relatedService.image} alt={relatedService.name} fill className="object-contain bg-white rounded-t-xl" style={{ objectFit: "contain" }} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{relatedService.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {relatedService.location}
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < Math.round(relatedService.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                  <span className="ml-2 text-gray-700 font-medium">{relatedService.rating}/5</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {relatedService.services.map((spec, k) => (
                    <span key={k} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{spec}</span>
                  ))}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Address:</span> {relatedService.address}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Phone:</span> {relatedService.phone}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Hours:</span> {relatedService.openingHours}
                </div>
                <div className="flex justify-end mt-auto">
                  <Link href={`/categories/breakdown-services/${relatedService.id}`}>
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