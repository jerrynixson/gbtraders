"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, Share2 } from "lucide-react";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface VehicleCardProps {
  id: number;
  image: string;
  title: string;
  price: number;
  monthlyPrice: number;
  year: string;
  mileage: string;
  fuel?: string;
  transmission?: string;
  distance: string;
  location: string;
  isFavoriteKey?: string;
  isHighlighted?: boolean;
  onShare?: () => void;
  view?: "grid" | "list";
}

export interface Vehicle {
  id: number;
  image: string;
  title: string;
  price: number;
  monthlyPrice: number;
  year: string;
  mileage: string;
  distance: string;
  location: string;
  tag: string;
  make: string;
  model: string;
  description: string;
  initialPayment: string;
  contractLength: string;
  milesPerYear: string;
  fuel?: string;
  transmission?: string;
}

export const VehicleCard = memo(function VehicleCard({
  id,
  image,
  title,
  price,
  monthlyPrice,
  year,
  mileage,
  fuel,
  transmission,
  distance,
  location,
  isFavoriteKey = "vehicle_favorites",
  isHighlighted,
  onShare,
  view = "grid"
}: VehicleCardProps) {
  const router = useRouter();
  const isGrid = view === "grid";
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === 'undefined') return false;
    const favorites = JSON.parse(localStorage.getItem(isFavoriteKey) || '[]');
    return favorites.some((fav: { id: number }) => fav.id === id);
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the favorite button
    if (typeof window === 'undefined') return;
    const favorites = JSON.parse(localStorage.getItem(isFavoriteKey) || '[]');
    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: { id: number }) => fav.id !== id);
      localStorage.setItem(isFavoriteKey, JSON.stringify(updatedFavorites));
    } else {
      favorites.push({ id, image, title, price, monthlyPrice, year, mileage, fuel, transmission, distance, location });
      localStorage.setItem(isFavoriteKey, JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the share button
    if (onShare) onShare();
  };

  return (
    <Link href={`/vehicle-info/${id}`} className="block">
      <div className={`group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100 ${isGrid ? 'flex flex-col h-full' : 'flex'} ${isHighlighted ? 'ring-2 ring-blue-100' : ''} cursor-pointer`}>
        <div className={`relative ${isGrid ? 'w-full' : 'w-1/3'}`}>
          <div className="relative overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={title}
              width={400}
              height={240}
              className={`object-cover w-full ${isGrid ? 'h-48' : 'h-full'} transition-transform duration-500 group-hover:scale-105`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-white text-sm font-medium">View Details</div>
            </div>
          </div>
          {isHighlighted && (
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
        
        <div className={`p-4 flex flex-col ${isGrid ? 'flex-grow' : 'flex-1'}`}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-blue-800 transition-colors duration-200 line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {distance}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{location}</span>
                </div>
              </div>
            </div>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110 flex-shrink-0"
              onClick={handleShareClick}
              type="button"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Year:</span>
              <span className="text-gray-600">{year}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Mileage:</span>
              <span className="text-gray-600">{mileage} mi</span>
            </div>
            {fuel && (
              <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
                <span className="font-medium text-gray-700 mr-1">Fuel:</span>
                <span className="text-gray-600">{fuel}</span>
              </div>
            )}
            {transmission && (
              <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
                <span className="font-medium text-gray-700 mr-1">Trans:</span>
                <span className="text-gray-600">{transmission}</span>
              </div>
            )}
          </div>
          
          <div className={`${isGrid ? 'mt-auto' : 'flex items-center justify-between gap-4 mt-4'}`}>
            <div className={`${isGrid ? '' : 'flex-1'}`}>
              <div className="text-xl font-bold text-blue-800">£{price.toLocaleString()}</div>
              <div className="text-xs text-gray-600">£{monthlyPrice.toLocaleString()}/month</div>
            </div>
            
            <Button 
              className={`${isGrid ? 'w-full mt-6' : 'w-40 ml-4 mt-6'} bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 h-10 shadow-md rounded-lg font-semibold`}
            >
              <span>View Details</span>
              <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
});

VehicleCard.displayName = "VehicleCard"; 