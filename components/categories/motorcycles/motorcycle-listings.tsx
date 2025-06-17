"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const motorcycles: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "Honda",
    model: "CBR650R",
    year: 2023,
    price: 7999,
    monthlyPrice: 166,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Grand Prix Red",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/bike1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "Yamaha",
    model: "MT-07",
    year: 2023,
    price: 6999,
    monthlyPrice: 235,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Matte Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/bike2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Kawasaki",
    model: "Ninja 650",
    year: 2023,
    price: 7499,
    monthlyPrice: 293,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Metallic Phantom Silver",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/bike3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Suzuki",
    model: "GSX-S750",
    year: 2023,
    price: 7299,
    monthlyPrice: 243,
    mileage: 0,
    fuel: "petrol",
    transmission: "manual",
    color: "Metallic Triton Blue",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/motorcycles/bike4.jpg"
  }
];

export function MotorcycleListings() {
  return (
    <Carousel
      items={motorcycles}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Motorcycles"
      viewMoreLink="/motorcycles"
      autoScroll={true}
    />
  );
}