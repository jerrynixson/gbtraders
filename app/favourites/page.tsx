"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Heart, ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { FavoritesRepository } from "@/lib/db/repositories/favoritesRepository"
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository"
import { VehicleCard } from "@/components/vehicle-card"
import { VehicleSummary } from "@/types/vehicles"

const favoritesRepo = new FavoritesRepository();
const vehicleRepo = new VehicleRepository();

export default function FavouritesPage() {
  const { user } = useAuth();
  const [favoriteVehicles, setFavoriteVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get favorite vehicle IDs
        const favoriteIds = await favoritesRepo.getUserFavorites(user.uid);
        
        // Fetch full vehicle details for each favorite, convert to VehicleSummary for correct image support
        const vehicles = await Promise.all(
          favoriteIds.map(async id => {
            const v = await vehicleRepo.getVehicleById(id);
            return v ? vehicleRepo.convertToSummary(v) : null;
          })
        );

        // Filter out any null values (in case a vehicle was deleted)
        setFavoriteVehicles(vehicles.filter((v): v is VehicleSummary => v !== null));
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
    window.addEventListener('favoritesUpdated', loadFavorites);

    return () => {
      window.removeEventListener('favoritesUpdated', loadFavorites);
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in to view your favorites</h2>
              <p className="text-gray-600 mb-6">Sign in to access your saved vehicle listings.</p>
              <Button 
                className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700"
                onClick={() => window.location.href = '/signin'}
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-50">
          <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="mt-2 text-gray-600">Your saved vehicle listings</p>
          </div>

          {favoriteVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">Start adding vehicles to your favorites by clicking the heart icon on any listing.</p>
              <Button 
                className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700"
                onClick={() => window.location.href = '/search'}
              >
                Browse Vehicles
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 