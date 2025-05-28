"use client";

import { useState } from "react";
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ChevronRight, Heart, Share2 } from "lucide-react"
import { VehicleCard } from "@/components/vehicle-card"

interface EBike {
  id: number;
  title: string;
  price: number;
  monthlyPrice: number;
  image: string;
  distance: string;
  location: string;
  year: number;
  mileage: number;
  battery: string;
  transmission: string;
  motor: string;
  color: string;
  description: string;
  isHighlighted?: boolean;
}

const eBikes: EBike[] = [
  {
    id: 1,
    title: "Specialized Turbo Vado SL 4.0",
    price: 2999,
    monthlyPrice: 299,
    image: "/e-bikes/bike1.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: 2023,
    mileage: 0,
    battery: "320Wh",
    transmission: "Shimano Deore",
    motor: "Specialized SL 1.1",
    color: "Gloss White",
    description: "Lightweight electric bike with premium components",
    isHighlighted: false,
  },
  {
    id: 2,
    title: "Trek Allant+ 7S",
    price: 3499,
    monthlyPrice: 349,
    image: "/e-bikes/bike2.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: 2023,
    mileage: 0,
    battery: "500Wh",
    transmission: "Shimano Deore XT",
    motor: "Bosch Performance Line",
    color: "Matte Black",
    description: "High-performance electric bike for urban commuting",
    isHighlighted: false,
  },
  {
    id: 3,
    title: "Giant Explore E+ 2 GTS",
    price: 2799,
    monthlyPrice: 279,
    image: "/e-bikes/bike3.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: 2023,
    mileage: 0,
    battery: "500Wh",
    transmission: "Shimano Deore",
    motor: "Yamaha PW-X2",
    color: "Deep Blue",
    description: "Versatile electric bike for all terrains",
    isHighlighted: false,
  },
  {
    id: 4,
    title: "Cannondale Adventure Neo 4",
    price: 2499,
    monthlyPrice: 249,
    image: "/e-bikes/bike4.jpg",
    distance: "0 miles away",
    location: "GB Traders",
    year: 2023,
    mileage: 0,
    battery: "400Wh",
    transmission: "Shimano Altus",
    motor: "Bosch Active Line",
    color: "Forest Green",
    description: "Comfortable electric bike for everyday use",
    isHighlighted: false,
  }
];

function EBikeCard({ bike }: { bike: EBike }) {
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === 'undefined') return false;
    const favorites = JSON.parse(localStorage.getItem('ebike_favorites') || '[]');
    return favorites.some((fav: EBike) => fav.id === bike.id);
  });

  const handleFavoriteClick = () => {
    if (typeof window === 'undefined') return;
    const favorites = JSON.parse(localStorage.getItem('ebike_favorites') || '[]');
    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: EBike) => fav.id !== bike.id);
      localStorage.setItem('ebike_favorites', JSON.stringify(updatedFavorites));
    } else {
      favorites.push(bike);
      localStorage.setItem('ebike_favorites', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  return (
    <div className={`group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100 flex flex-col h-full ${bike.isHighlighted ? 'ring-2 ring-blue-100' : ''}`}> 
      <div className="relative w-full">
        <div className="relative overflow-hidden">
          <Image
            src={bike.image}
            alt={bike.title}
            width={400}
            height={240}
            className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-white text-sm font-medium">View Details</div>
          </div>
        </div>
        {bike.isHighlighted && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white text-xs py-1 px-2 rounded-full font-medium z-10 shadow-sm">
            Featured
          </div>
        )}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all duration-200 hover:scale-110 z-10"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-blue-800 transition-colors duration-200 line-clamp-2">{bike.title}</h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {bike.distance}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{bike.location}</span>
                </div>
              </div>
            </div>
            <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110 flex-shrink-0">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Year:</span>
              <span className="text-gray-600">{bike.year}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Mileage:</span>
              <span className="text-gray-600">{bike.mileage.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Battery:</span>
              <span className="text-gray-600">{bike.battery}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Trans:</span>
              <span className="text-gray-600">{bike.transmission}</span>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <div>
            <div className="text-xl font-bold text-blue-800">{bike.price}</div>
            <div className="text-xs text-gray-600">{bike.monthlyPrice}/month</div>
          </div>
          <Button className="w-full mt-6 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 h-10 shadow-md rounded-lg font-semibold">
            <span>View Details</span>
            <ChevronRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EBikeListings() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">E-Bikes for Sale</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {eBikes.map((bike) => (
            <VehicleCard key={bike.id} {...bike} />
          ))}

          {/* Next button */}
          <Button variant="ghost" size="icon" className="absolute -right-12 top-1/2 transform -translate-y-1/2">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          <Link href="#" className="flex items-center text-sm text-primary">
            View more e-bikes <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
} 