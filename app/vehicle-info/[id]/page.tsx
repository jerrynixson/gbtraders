"use client"

import { Header } from "@/components/header"
import { CarImageSection } from "@/components/car/car-image-section"
import { VehicleDetails as VehicleDetailsComponent } from "@/components/car/vehicle-summary"
import { HowLeasingWorks } from "@/components/car/how-leasing-works"
import { Reviews } from "@/components/car/reviews"
import { DealerInformation } from "@/components/car/dealer-information"
import { MoreFromDealer } from "@/components/car/more-from-dealer"
import { CarDetailsPayment } from "@/components/car/car-details-payment"
import { Footer } from "@/components/footer"
import { ScrollText, FileSearch } from "lucide-react"
import { Heart, ChevronRight, Flag } from "lucide-react"
import { FeaturesDropdown } from "@/components/car/features-dropdown"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { GoogleMapComponent } from "@/components/ui/google-map"
import { Vehicle } from "@/types/vehicles"
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository"

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
  initialPayment: string;
  monthlyPayments: number;
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
}

export default function VehicleDetails() {
  const params = useParams();
  const vehicleId = params.id as string;
  const [state, setState] = useState<VehiclePageState>({
    vehicle: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const repository = new VehicleRepository();
        const vehicle = await repository.getVehicle(vehicleId);
        setState({
          vehicle,
          loading: false,
          error: vehicle ? null : "Vehicle not found"
        });
      } catch (error) {
        setState({
          vehicle: null,
          loading: false,
          error: "Failed to load vehicle details"
        });
        console.error("Error fetching vehicle:", error);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  if (state.loading) {
    return (
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
  }

  if (state.error || !state.vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">{state.error || "Vehicle not found"}</h1>
            <p className="mt-2 text-gray-600">The vehicle you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const vehicle = state.vehicle;

  // Convert vehicle data to specifications format
  const specifications = {
    fuelType: vehicle.fuel || "N/A",
    bodyType: 'bodyStyle' in vehicle ? vehicle.bodyStyle : 'bodyType' in vehicle ? vehicle.bodyType : "N/A",
    gearbox: vehicle.transmission || "N/A",
    doors: 'doors' in vehicle ? vehicle.doors : 0,
    seats: 'seats' in vehicle ? vehicle.seats : 0,
    mileage: vehicle.mileage,
    engineSize: 'engineSize' in vehicle ? `${vehicle.engineSize}L` : "N/A",
  };

  // Convert vehicle data to running costs format (if available)
  const runningCosts = {
    mpg: 0, // These would need to be added to your vehicle types if needed
    costToFill: 0,
    range: 0,
    ulezCompliant: true,
    insuranceGroup: 0,
    vehicleTax: 0,
  };

  // Dealer information from the vehicle
  const dealerInfo = {
    name: "Dealer information not available", // You might want to fetch this from a dealers collection
    location: vehicle.location.city,
    rating: 0,
    phoneNumber: "Contact information not available",
    description: "Dealer description not available",
  };

  // Car details for payment section
  const carDetails = {
    carName: `${vehicle.make} ${vehicle.model}`,
    carDescription: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    price: `£${vehicle.price.toLocaleString()}`,
    initialPayment: vehicle.monthlyPrice ? `£${(vehicle.monthlyPrice * 3).toLocaleString()}` : "N/A",
    monthlyPayments: vehicle.monthlyPrice ? vehicle.monthlyPrice : 0,
    dealerName: dealerInfo.name,
    dealerLocation: vehicle.location.city,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7">
            <CarImageSection images={vehicle.images} />
            <VehicleDetailsComponent 
              specifications={specifications}
              runningCosts={runningCosts}
            />

            {/* Vehicle Description Box */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 mb-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">About This Vehicle</h3>
              <p className="text-gray-600 leading-relaxed">
                {`${vehicle.year} ${vehicle.make} ${vehicle.model} - This ${vehicle.type === 'used-car' ? 'pre-owned' : 'new'} vehicle comes with ${vehicle.features.length} features including: ${vehicle.features.slice(0, 3).join(', ')}${vehicle.features.length > 3 ? '...' : ''}`}
              </p>
              {vehicle.type === 'used-car' && (
                <div className="mt-4">
                  <button className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-3 px-6 rounded-lg font-medium shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                    <FileSearch className="h-5 w-5 transition-transform group-hover:rotate-6" />
                    <span>Check Vehicle History</span>
                  </button>
                </div>
              )}
            </div>

            {/* Features Dropdown */}
            <div className="mt-4 mb-6">
              <FeaturesDropdown 
                specifications={specifications}
                runningCosts={runningCosts}
              />
            </div>

            <HowLeasingWorks />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            {/* Add to Favorites and Report Listing Buttons */}
            <div className="flex justify-between items-center mb-4">
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Heart className="h-4 w-4" />
                <span>Save</span>
              </button>

              <button className="inline-flex items-center justify-center rounded-md bg-muted p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Flag className="h-4 w-4" />
              </button>
            </div>

            <CarDetailsPayment {...carDetails} />
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
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>This vehicle is currently located at {vehicle.location.address}, {vehicle.location.city}.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 