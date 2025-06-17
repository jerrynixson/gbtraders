"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const trucks: VehicleSummary[] = [
  {
    id: "1",
    type: "truck",
    make: "Mercedes-Benz",
    model: "Actros 1845",
    year: 2023,
    price: 129999,
    monthlyPrice: 1299,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Obsidian Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/truck1.jpg"
  },
  {
    id: "2",
    type: "truck",
    make: "Volvo",
    model: "FH 460",
    year: 2023,
    price: 149999,
    monthlyPrice: 1499,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Silver",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/truck2.jpg"
  },
  {
    id: "3",
    type: "truck",
    make: "Scania",
    model: "R 450",
    year: 2023,
    price: 139999,
    monthlyPrice: 1399,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "Red",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/truck3.jpg"
  },
  {
    id: "4",
    type: "truck",
    make: "DAF",
    model: "XF 450",
    year: 2023,
    price: 119999,
    monthlyPrice: 1199,
    mileage: 0,
    fuel: "diesel",
    transmission: "automatic",
    color: "White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/trucks/truck4.jpg"
  }
];

export function TruckListings() {
  return (
    <Carousel
      items={trucks}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Trucks"
      viewMoreLink="/trucks"
      autoScroll={true}
    />
  );
} 