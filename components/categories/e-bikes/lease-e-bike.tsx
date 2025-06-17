"use client";

import { VehicleCard } from "@/components/vehicle-card"
import { Carousel } from "@/components/ui/carousel"
import { VehicleSummary } from "@/types/vehicles"

const leaseEBikes: VehicleSummary[] = [
  {
    id: "1",
    type: "car",
    make: "Specialized",
    model: "Turbo Vado SL 4.0",
    year: 2023,
    price: 2999,
    monthlyPrice: 99,
    mileage: 0,
    fuel: "electric",
    transmission: "manual",
    color: "Gloss White",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/lease-bike1.jpg"
  },
  {
    id: "2",
    type: "car",
    make: "Trek",
    model: "Allant+ 7S",
    year: 2023,
    price: 3499,
    monthlyPrice: 129,
    mileage: 0,
    fuel: "electric",
    transmission: "manual",
    color: "Matte Black",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/lease-bike2.jpg"
  },
  {
    id: "3",
    type: "car",
    make: "Giant",
    model: "Explore E+ 2",
    year: 2023,
    price: 2799,
    monthlyPrice: 89,
    mileage: 0,
    fuel: "electric",
    transmission: "manual",
    color: "Deep Blue",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/lease-bike3.jpg"
  },
  {
    id: "4",
    type: "car",
    make: "Cannondale",
    model: "Adventure Neo 4",
    year: 2023,
    price: 2499,
    monthlyPrice: 79,
    mileage: 0,
    fuel: "electric",
    transmission: "manual",
    color: "Forest Green",
    location: {
      address: "GB Traders",
      city: "London",
      country: "UK"
    },
    mainImage: "/e-bikes/lease-bike4.jpg"
  }
];

export function LeaseEBikeListings() {
  return (
    <Carousel
      items={leaseEBikes}
      renderItem={(vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          view="grid"
        />
      )}
      title="Lease an E-Bike"
      viewMoreLink="/e-bikes/lease"
      autoScroll={true}
    />
  );
} 