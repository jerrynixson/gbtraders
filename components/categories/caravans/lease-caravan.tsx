"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const leaseCaravans: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "Swift",
    model: "Challenger 580",
    year: 2023,
    price: 399,
    monthlyPrice: 399,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/lease-caravan1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "Bailey",
    model: "Unicorn Vigo",
    year: 2023,
    price: 449,
    monthlyPrice: 449,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/lease-caravan2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Lunar",
    model: "Clubman ES",
    year: 2023,
    price: 429,
    monthlyPrice: 429,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/lease-caravan3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Elddis",
    model: "Avante 840",
    year: 2023,
    price: 379,
    monthlyPrice: 379,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/lease-caravan4.jpg"
  }
];

export function LeaseCaravanListings() {
  return (
    <Carousel
      items={leaseCaravans}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Lease Caravans"
      viewMoreLink="/caravans/lease"
      autoScroll={true}
    />
  );
}