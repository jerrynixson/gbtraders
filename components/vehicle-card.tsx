"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, Heart, Share2, MapPin } from "lucide-react";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VehicleSummary } from '@/types/vehicles';
import { formatCurrency, formatNumber } from '@/lib/utils';

export interface VehicleCardProps {
  vehicle: VehicleSummary;
  view: 'grid' | 'list';
}

export const VehicleCard = memo(function VehicleCard({ vehicle, view }: VehicleCardProps) {
  const router = useRouter();
  const isGrid = view === "grid";
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === 'undefined') return false;
    const favorites = JSON.parse(localStorage.getItem("vehicle_favorites") || '[]');
    return favorites.some((fav: { id: number }) => fav.id === vehicle.id);
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the favorite button
    if (typeof window === 'undefined') return;
    const favorites = JSON.parse(localStorage.getItem("vehicle_favorites") || '[]');
    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav: { id: number }) => fav.id !== vehicle.id);
      localStorage.setItem("vehicle_favorites", JSON.stringify(updatedFavorites));
    } else {
      favorites.push({ ...vehicle, id: vehicle.id });
      localStorage.setItem("vehicle_favorites", JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the share button
    if (vehicle.onShare) vehicle.onShare();
  };

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="block">
      <div className={`group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg ${
        view === 'list' ? 'flex gap-6' : ''
      }`}>
        {/* Image container */}
        <div className={`relative ${view === 'list' ? 'w-72 shrink-0' : 'w-full'} aspect-[4/3] overflow-hidden`}>
          <Image
            src={vehicle.mainImage}
            alt={vehicle.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={view === 'list' ? '(max-width: 768px) 100vw, 288px' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 backdrop-blur hover:bg-white"
            aria-label="Add to favorites"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            <Link href={`/vehicles/${vehicle.id}`} className="hover:text-blue-600">
              {vehicle.title}
            </Link>
          </h3>

          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(vehicle.price)}
            </div>
            {vehicle.monthlyPrice && (
              <div className="text-sm text-gray-600">
                {formatCurrency(vehicle.monthlyPrice)}/month
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              {vehicle.location.city}, {vehicle.location.country}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>Year: {vehicle.year}</div>
              <div>Mileage: {formatNumber(vehicle.mileage)}mi</div>
              {vehicle.fuel && <div>Fuel: {vehicle.fuel}</div>}
              {vehicle.transmission && <div>Trans: {vehicle.transmission}</div>}
            </div>
          </div>

          {/* Features */}
          {view === 'list' && vehicle.features.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Features:</div>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.slice(0, 4).map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {feature}
                  </span>
                ))}
                {vehicle.features.length > 4 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{vehicle.features.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

VehicleCard.displayName = "VehicleCard"; 