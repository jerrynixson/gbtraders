"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const leaseElectricVehicles: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "Tesla",
    model: "Model 3 Long Range AWD",
    year: 2023,
    price: 549,
    monthlyPrice: 549,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Midnight Silver",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/lease-ev1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "BMW",
    model: "i4 eDrive40 M Sport",
    year: 2023,
    price: 649,
    monthlyPrice: 649,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Mineral White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/lease-ev2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Audi",
    model: "Q4 e-tron 50 quattro S line",
    year: 2023,
    price: 599,
    monthlyPrice: 599,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Daytona Gray",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/lease-ev3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Mercedes-Benz",
    model: "EQS 450+ AMG Line",
    year: 2023,
    price: 729,
    monthlyPrice: 729,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Obsidian Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/electric-vehicles/lease-ev4.jpg"
  }
];

export function LeaseElectricVehicleListings() {
  return (
    <Carousel
      items={leaseElectricVehicles}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Lease Electric Vehicles"
      viewMoreLink="/electric-vehicles/lease"
      autoScroll={true}
    />
  );
} 