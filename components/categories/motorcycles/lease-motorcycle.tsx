"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const leaseMotorcycles: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "BMW",
    model: "R 1250 GS",
    year: 2023,
    price: 299,
    monthlyPrice: 299,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Rallye Style",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/lease-moto1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "Ducati",
    model: "Panigale V4",
    year: 2023,
    price: 399,
    monthlyPrice: 399,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Ducati Red",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/lease-moto2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Honda",
    model: "CBR 1000RR-R",
    year: 2023,
    price: 349,
    monthlyPrice: 349,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Grand Prix Red",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/lease-moto3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Kawasaki",
    model: "Ninja H2",
    year: 2023,
    price: 449,
    monthlyPrice: 449,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Metallic Phantom Silver",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/lease-moto4.jpg"
  }
];

export function LeaseMotorcycleListings() {
  return (
    <Carousel
      items={leaseMotorcycles}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Lease Motorcycles"
      viewMoreLink="/motorcycles/lease"
      autoScroll={true}
    />
  );
}