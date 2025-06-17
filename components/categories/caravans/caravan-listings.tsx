"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const caravans: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "Swift",
    model: "Challenger 580",
    year: 2023,
    price: 24999,
    monthlyPrice: 416,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/caravan1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "Bailey",
    model: "Phoenix 640",
    year: 2023,
    price: 22999,
    monthlyPrice: 383,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/caravan2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Lunar",
    model: "Clubman ES",
    year: 2023,
    price: 26999,
    monthlyPrice: 450,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/caravan3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Elddis",
    model: "Avante 840",
    year: 2023,
    price: 23999,
    monthlyPrice: 400,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/caravans/caravan4.jpg"
  }
];

export function CaravanListings() {
  return (
    <Carousel
      items={caravans}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Caravans"
      viewMoreLink="/caravans"
      autoScroll={true}
    />
  );
}