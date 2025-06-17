"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const vans: VehicleSummary[] = [
  {
    id: "1",
    type: "van",
    make: "Mercedes-Benz",
    model: "Sprinter 313 CDI",
    year: 2023,
    price: 39999,
    monthlyPrice: 399,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Obsidian Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/van1.jpg"
  },
  {
    id: "2",
    type: "van",
    make: "Ford",
    model: "Transit Custom 280",
    year: 2023,
    price: 34999,
    monthlyPrice: 349,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Frozen White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/van2.jpg"
  },
  {
    id: "3",
    type: "van",
    make: "Volkswagen",
    model: "Transporter T6.1",
    year: 2023,
    price: 37999,
    monthlyPrice: 379,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Pure Grey",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/van3.jpg"
  },
  {
    id: "4",
    type: "van",
    make: "Renault",
    model: "Trafic 150",
    year: 2023,
    price: 32999,
    monthlyPrice: 329,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Pearl White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/vans/van4.jpg"
  }
];

export function VanListings() {
  return (
    <Carousel
      items={vans}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Vans"
      viewMoreLink="/vans"
      autoScroll={true}
    />
  );
}