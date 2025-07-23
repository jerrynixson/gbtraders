"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, Share2 } from "lucide-react";
import { useState, memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VehicleSummary } from "@/types/vehicles";
import { useAuth } from '@/hooks/useAuth';
import { FavoritesRepository } from '@/lib/db/repositories/favoritesRepository';

const favoritesRepo = new FavoritesRepository();

export interface VehicleCardProps {
  vehicle: VehicleSummary;
  isHighlighted?: boolean;
  onShare?: () => void;
  view?: "grid" | "list";
}

export const VehicleCard = memo(function VehicleCard({
  vehicle,
  isHighlighted,
  onShare,
  view = "grid"
}: VehicleCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isGrid = view === "grid";
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user) {
        const isFav = await favoritesRepo.isFavorite(user.uid, vehicle.id);
        setIsFavorite(isFav);
      }
    };
    checkFavoriteStatus();
  }, [user, vehicle.id]);

  // Early return if vehicle is undefined or missing required properties
  if (!vehicle || !vehicle.id || !vehicle.make || !vehicle.model || !vehicle.year) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the favorite button
    if (!user) {
      router.push('/signin');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesRepo.removeFromFavorites(user.uid, vehicle.id);
      } else {
        await favoritesRepo.addToFavorites(user.uid, vehicle.id);
      }
      setIsFavorite(!isFavorite);
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the share button
    if (onShare) onShare();
  };

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const location = vehicle.location ? `${vehicle.location.city}, ${vehicle.location.country}` : 'Location not available';

  return (
    <Link href={`/vehicle-info/${vehicle.id}`} className="block">
      <div className={`group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100 flex flex-col h-full ${isHighlighted ? 'ring-2 ring-blue-100' : ''} cursor-pointer`}>
        <div className="relative">
          <div className="relative overflow-hidden">
            <Image
              src={vehicle.mainImage || "/placeholder.svg"}
              alt={title}
              width={400}
              height={240}
              className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-105"
            />
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
        
        <div className={`p-4 flex flex-col flex-grow`}> {/* Always flex-grow for grid/list */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              <div className="h-[3rem] mb-1">
                <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-blue-800 transition-colors duration-200 line-clamp-2">
                  {title}
                </h3>
              </div>
              <div className="flex items-center">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {location}
                  </span>
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
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
              <span className="font-medium text-gray-700">Year:</span>
              <span className="text-gray-600">{vehicle.year}</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
              <span className="font-medium text-gray-700">Mileage:</span>
              <span className="text-gray-600">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
              <span className="font-medium text-gray-700">Fuel:</span>
              <span className="text-gray-600">{vehicle.fuel || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg">
              <span className="font-medium text-gray-700">Trans:</span>
              <span className="text-gray-600">{vehicle.transmission || 'N/A'}</span>
            </div>
          </div>
          {/* Remove the flex-grow spacer and use mt-auto on the price/button container */}
          <div className="flex flex-col w-full mt-auto">
            <div className="text-xl font-bold text-blue-800 mb-2">£{vehicle.price?.toLocaleString() || 'N/A'}</div>
            {vehicle.monthlyPrice && (
              <div className="text-xs text-gray-600 mb-2">£{vehicle.monthlyPrice.toLocaleString()}/month</div>
            )}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              View Details <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
});

VehicleCard.displayName = "VehicleCard"; 