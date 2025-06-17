"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const leaseVans: VehicleSummary[] = [
  {
    id: "1",
    type: "van",
    make: "Mercedes-Benz",
    model: "Sprinter 2500",
    year: 2023,
    price: 499,
    monthlyPrice: 499,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Obsidian Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/lease-van1.jpg"
  },
  {
    id: "2",
    type: "van",
    make: "Ford",
    model: "Transit Custom",
    year: 2023,
    price: 449,
    monthlyPrice: 449,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Frozen White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/lease-van2.jpg"
  },
  {
    id: "3",
    type: "van",
    make: "Volkswagen",
    model: "Crafter",
    year: 2023,
    price: 529,
    monthlyPrice: 529,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Pure Grey",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/lease-van3.jpg"
  },
  {
    id: "4",
    type: "van",
    make: "Renault",
    model: "Master",
    year: 2023,
    price: 479,
    monthlyPrice: 479,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Pearl White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/lease-van4.jpg"
  }
];

export function LeaseVanListings() {
  return (
    <Carousel
      items={leaseVans}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Lease Vans"
      viewMoreLink="/vans/lease"
      autoScroll={true}
    />
  );
}