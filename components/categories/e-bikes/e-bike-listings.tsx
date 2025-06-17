"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const eBikes: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "Trek",
    model: "Powerfly 5",
    year: 2023,
    price: 3499,
    monthlyPrice: 349,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Matte Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/ebike1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "Specialized",
    model: "Turbo Levo",
    year: 2023,
    price: 3999,
    monthlyPrice: 399,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Gloss Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/ebike2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Giant",
    model: "Explore E+",
    year: 2023,
    price: 2999,
    monthlyPrice: 299,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Blue",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/ebike3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Cannondale",
    model: "Adventure Neo",
    year: 2023,
    price: 3299,
    monthlyPrice: 329,
    mileage: 0,
    fuel: "electric",
    transmission: "automatic",
    color: "Red",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/ebike4.jpg"
  }
];

export function EBikeListings() {
  return (
    <Carousel
      items={eBikes}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="E-Bikes"
      viewMoreLink="/e-bikes"
      autoScroll={true}
    />
  );
} 