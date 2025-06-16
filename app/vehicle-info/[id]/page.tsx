"use client"

import { Header } from "@/components/header"
import { CarImageSection } from "@/components/car/car-image-section"
import { DealerInformation } from "@/components/car/dealer-information"
import { CarDetailsPayment } from "@/components/car/car-details-payment"
import { Footer } from "@/components/footer"
import { FileSearch, Calendar, Clock, MapPin, Tag, Car, Truck } from "lucide-react"
import { Heart, Flag } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, Suspense } from "react"
import { GoogleMapComponent } from "@/components/ui/google-map"
import { Vehicle, Car as CarType, UsedCar, Van as VanType, Truck as TruckType, VehicleStatus, VehicleType } from "@/types/vehicles"
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository"
import { FavoritesRepository } from "@/lib/db/repositories/favoritesRepository"
import { useAuth } from "@/hooks/useAuth"
import { CommonVehicleDetails, VehicleDocumentation, VehicleSpecificDetails } from "./components"
import { useRouter } from "next/navigation"

interface VehicleSpecifications {
  fuelType: string;
  bodyType: string;
  gearbox: string;
  doors: number;
  seats: number;
  mileage: number;
  engineSize: string;
}

interface RunningCosts {
  mpg: number;
  costToFill: number;
  range: number;
  ulezCompliant: boolean;
  insuranceGroup: number;
  vehicleTax: number;
}

interface ReviewData {
  carName: string;
  rating: number;
  reviewText: string;
}

interface DealerInfo {
  name: string;
  location: string;
  rating: number;
  phoneNumber: string;
  description: string;
}

interface DealerCar {
  price: string;
  term: string;
  name: string;
  description: string;
  fullPrice: string;
  year: string;
  fuelType: string;
  transmission: string;
}

interface CarDetails {
  carName: string;
  carDescription: string;
  price: string;
  dealerName: string;
  dealerLocation: string;
}

interface VehicleData {
  specifications: VehicleSpecifications;
  runningCosts: RunningCosts;
  reviewData: ReviewData;
  dealerInfo: DealerInfo;
  dealerCars: DealerCar[];
  carDetails: CarDetails;
}

interface VehiclePageState {
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  userLocation: { lat: number; lng: number } | null;
  isFavorite: boolean;
}

// Helper function to render vehicle type icon
function VehicleTypeIcon({ type }: { type: VehicleType }) {
  switch (type) {
    case 'car':
    case 'used-car':
      return <Car className="h-5 w-5" />;
    case 'van':
      return <Truck className="h-5 w-5" />; // Using Truck icon for van as Van is not available
    case 'truck':
      return <Truck className="h-5 w-5" />;
    default:
      return null;
  }
}

// Loading component
const LoadingState = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
      </div>
    </main>
    <Footer />
  </div>
);

// Error component
const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">{message}</h1>
        <p className="mt-2 text-gray-600">The vehicle you're looking for doesn't exist or has been removed.</p>
      </div>
    </main>
    <Footer />
  </div>
);

// Vehicle content component
const VehicleContent = ({ vehicle, userLocation, isFavorite, onFavoriteClick }: { 
  vehicle: Vehicle; 
  userLocation: { lat: number; lng: number } | null;
  isFavorite: boolean;
  onFavoriteClick: () => void;
}) => {
  const dealerInfo = {
    name: "Dealer information not available",
    location: vehicle.location.city,
    rating: 0,
    phoneNumber: "Contact information not available",
    description: "Dealer description not available",
  };

  const carDetails = {
    carName: `${vehicle.make} ${vehicle.model}`,
    carDescription: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    price: `£${vehicle.price.toLocaleString()}`,
    dealerName: dealerInfo.name,
    dealerLocation: vehicle.location.city,
  };

  return (
    <>
      {/* CarImageSection for mobile - appears first */}
      <div className="lg:hidden mb-6">
        <Suspense fallback={<div>Loading images...</div>}>
          <CarImageSection images={vehicle.images} />
        </Suspense>
      </div>

      {/* CarDetailsPayment for mobile - appears second */}
      <div className="lg:hidden mb-6">
        <CarDetailsPayment {...carDetails} />
      </div>

      {/* Other details for mobile - appears third */}
      <div className="lg:hidden">
        <CommonVehicleDetails vehicle={vehicle} />
        <VehicleDocumentation vehicle={vehicle} />
        <VehicleSpecificDetails vehicle={vehicle} />

        {/* Features Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Features</h3>
          <div className="grid grid-cols-2 gap-2">
            {vehicle.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add to Favorites and Report Listing Buttons */}
        <div className="flex justify-between items-center mb-4 mt-6">
          <button 
            className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={onFavoriteClick}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            <span>{isFavorite ? 'Saved' : 'Save'}</span>
          </button>

          <button 
            className="inline-flex items-center justify-center rounded-md bg-muted p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => {/* TODO: Implement report functionality */}}
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>

        <DealerInformation {...dealerInfo} />
        
        {/* Vehicle Location Map */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Location</h3>
          <div className="w-full h-[300px] rounded-lg overflow-hidden">
            <GoogleMapComponent 
              center={vehicle.location.coordinates ? 
                { lat: vehicle.location.coordinates.latitude, lng: vehicle.location.coordinates.longitude } :
                { lat: 51.4543, lng: -2.5879 }
              }
              zoom={13}
              markers={[
                {
                  position: vehicle.location.coordinates ? 
                    { lat: vehicle.location.coordinates.latitude, lng: vehicle.location.coordinates.longitude } :
                    { lat: 51.4543, lng: -2.5879 },
                  title: `${vehicle.make} ${vehicle.model}`
                },
                ...(userLocation ? [{
                  position: userLocation,
                  title: "Your Location"
                }] : [])
              ]}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>This vehicle is currently located at {vehicle.location.address}, {vehicle.location.city}.</p>
          </div>
        </div>
      </div>

      {/* Main content grid for desktop - hidden on mobile */}
      <div className="hidden lg:grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7">
          <Suspense fallback={<div>Loading images...</div>}>
            <CarImageSection images={vehicle.images} />
          </Suspense>
          
          <CommonVehicleDetails vehicle={vehicle} />
          <VehicleDocumentation vehicle={vehicle} />
          <VehicleSpecificDetails vehicle={vehicle} />

          {/* Features Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {vehicle.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5">
          {/* Add to Favorites and Report Listing Buttons */}
          <div className="flex justify-between items-center mb-4">
            <button 
              className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={onFavoriteClick}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>

            <button 
              className="inline-flex items-center justify-center rounded-md bg-muted p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => {/* TODO: Implement report functionality */}}
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>

          {/* CarDetailsPayment for desktop - remains in right column */}
          <div className="hidden lg:block">
             <CarDetailsPayment {...carDetails} />
          </div>

          <DealerInformation {...dealerInfo} />
          
          {/* Vehicle Location Map */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Location</h3>
            <div className="w-full h-[300px] rounded-lg overflow-hidden">
              <GoogleMapComponent 
                center={vehicle.location.coordinates ? 
                  { lat: vehicle.location.coordinates.latitude, lng: vehicle.location.coordinates.longitude } :
                  { lat: 51.4543, lng: -2.5879 }
                }
                zoom={13}
                markers={[
                  {
                    position: vehicle.location.coordinates ? 
                      { lat: vehicle.location.coordinates.latitude, lng: vehicle.location.coordinates.longitude } :
                      { lat: 51.4543, lng: -2.5879 },
                    title: `${vehicle.make} ${vehicle.model}`
                  },
                  ...(userLocation ? [{
                    position: userLocation,
                    title: "Your Location"
                  }] : [])
                ]}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>This vehicle is currently located at {vehicle.location.address}, {vehicle.location.city}.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function VehicleDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [state, setState] = useState<VehiclePageState>({
    vehicle: null,
    loading: true,
    error: null,
    userLocation: null,
    isFavorite: false
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const vehicleId = params.id as string;
        console.log('Fetching vehicle with ID:', vehicleId);
        
        const vehicleRepo = new VehicleRepository();
        const vehicle = await vehicleRepo.getVehicleById(vehicleId);
        
        console.log('Vehicle fetch result:', vehicle);
        
        if (!vehicle) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Vehicle not found'
          }));
          return;
        }

        // Check if vehicle is in favorites
        let isFavorite = false;
        if (user) {
          const favoritesRepo = new FavoritesRepository();
          isFavorite = await favoritesRepo.isFavorite(user.uid, vehicleId);
        }

        setState(prev => ({
          ...prev,
          vehicle,
          loading: false,
          isFavorite
        }));
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load vehicle details'
        }));
      }
    };

    fetchVehicle();
  }, [params.id, user]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState(prev => ({
            ...prev,
            userLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          // Handle specific geolocation errors
          let errorMessage = "Unable to get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied. Please enable location services to see your position on the map.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please try again later.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }
          console.warn("Geolocation error:", errorMessage);
          // Don't update state with error, just log it - the map will still work without user location
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleFavoriteClick = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    if (!state.vehicle) return;

    try {
      const favoritesRepo = new FavoritesRepository();
      if (state.isFavorite) {
        await favoritesRepo.removeFromFavorites(user.uid, state.vehicle.id);
      } else {
        await favoritesRepo.addToFavorites(user.uid, state.vehicle.id);
      }
      setState(prev => ({
        ...prev,
        isFavorite: !prev.isFavorite
      }));
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  if (state.loading) {
    return <LoadingState />;
  }

  if (state.error || !state.vehicle) {
    return <ErrorState message={state.error || "Vehicle not found"} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<LoadingState />}>
          <VehicleContent 
            vehicle={state.vehicle} 
            userLocation={state.userLocation}
            isFavorite={state.isFavorite}
            onFavoriteClick={handleFavoriteClick}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 