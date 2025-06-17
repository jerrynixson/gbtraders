"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const electricVehicles: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    price: 42999,
    monthlyPrice: 429,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Midnight Silver",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/ev1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "BMW",
    model: "i4",
    year: 2023,
    price: 49999,
    monthlyPrice: 499,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Mineral White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/ev2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Audi",
    model: "Q4 e-tron",
    year: 2023,
    price: 45999,
    monthlyPrice: 459,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Daytona Gray",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/ev3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Mercedes-Benz",
    model: "EQS",
    year: 2023,
    price: 89999,
    monthlyPrice: 899,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Obsidian Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/ev4.jpg"
  }
];

export function ElectricVehicleListings() {
  return (
    <Carousel
      items={electricVehicles}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Electric Vehicles"
      viewMoreLink="/electric-vehicles"
      autoScroll={true}
    />
  );
} 