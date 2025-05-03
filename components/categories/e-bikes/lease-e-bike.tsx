"use client";

import { useState } from "react";
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronRight, Heart, Share2 } from "lucide-react"
import { VehicleCard, Vehicle } from "@/components/vehicle-card"

const leaseEBikes: Vehicle[] = [
  {
    id: 1,
    title: "Specialized Turbo Vado SL 4.0",
    price: 2999,
    monthlyPrice: 99,
    image: "/e-bikes/lease-bike1.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: "2023",
    mileage: "0",
    fuel: "Electric",
    transmission: "Shimano Deore",
    tag: "Lease",
    make: "Specialized",
    model: "Turbo Vado SL 4.0",
    description: "Lightweight electric bike with premium components",
    initialPayment: "£299",
    contractLength: "36",
    milesPerYear: "0",
  },
  {
    id: 2,
    title: "Trek Allant+ 7S",
    price: 3499,
    monthlyPrice: 129,
    image: "/e-bikes/lease-bike2.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: "2023",
    mileage: "0",
    fuel: "Electric",
    transmission: "Shimano Deore XT",
    tag: "Lease",
    make: "Trek",
    model: "Allant+ 7S",
    description: "Premium electric bike with advanced features",
    initialPayment: "£349",
    contractLength: "36",
    milesPerYear: "0",
  },
  {
    id: 3,
    title: "Giant Explore E+ 2",
    price: 2799,
    monthlyPrice: 89,
    image: "/e-bikes/lease-bike3.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: "2023",
    mileage: "0",
    fuel: "Electric",
    transmission: "Shimano Deore",
    tag: "Lease",
    make: "Giant",
    model: "Explore E+ 2",
    description: "Versatile electric bike for urban commuting",
    initialPayment: "£279",
    contractLength: "36",
    milesPerYear: "0",
  },
  {
    id: 4,
    title: "Cannondale Adventure Neo 4",
    price: 2499,
    monthlyPrice: 79,
    image: "/e-bikes/lease-bike4.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: "2023",
    mileage: "0",
    fuel: "Electric",
    transmission: "Shimano Acera",
    tag: "Lease",
    make: "Cannondale",
    model: "Adventure Neo 4",
    description: "Comfortable electric bike for everyday use",
    initialPayment: "£249",
    contractLength: "36",
    milesPerYear: "0",
  }
];

export function LeaseEBikeListings() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Lease an E-Bike</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {leaseEBikes.map((vehicle) => (
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
            View more lease deals <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  )
} 