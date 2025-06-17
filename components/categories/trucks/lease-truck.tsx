"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const leaseTrucks: VehicleSummary[] = [
  {
    id: "1",
    type: "truck",
    make: "Ford",
    model: "F-150 XLT",
    year: 2023,
    price: 499,
    monthlyPrice: 499,
    mileage: 0,
    fuel: "petrol",
    transmission: "automatic",
    color: "Oxford White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/lease-truck1.jpg"
  },
  {
    id: "2",
    type: "truck",
    make: "Chevrolet",
    model: "Silverado 1500 LT",
    year: 2023,
    price: 549,
    monthlyPrice: 549,
    mileage: 0,
    fuel: "petrol",
    transmission: "automatic",
    color: "Summit White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/lease-truck2.jpg"
  },
  {
    id: "3",
    type: "truck",
    make: "RAM",
    model: "1500 Laramie",
    year: 2023,
    price: 599,
    monthlyPrice: 599,
    mileage: 0,
    fuel: "petrol",
    transmission: "automatic",
    color: "Bright White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/lease-truck3.jpg"
  },
  {
    id: "4",
    type: "truck",
    make: "Toyota",
    model: "Tundra Limited",
    year: 2023,
    price: 529,
    monthlyPrice: 529,
    mileage: 0,
    fuel: "petrol",
    transmission: "automatic",
    color: "Celestial Silver",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/lease-truck4.jpg"
  }
];

export function LeaseTruckListings() {
  return (
    <Carousel
      items={leaseTrucks}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Lease Trucks"
      viewMoreLink="/trucks/lease"
      autoScroll={true}
    />
  );
} 