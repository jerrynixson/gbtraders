"use client"

import { Header } from "@/components/header"
import { CarImageSection } from "@/components/car/car-image-section"
import { DealerInformation } from "@/components/car/dealer-information"
import { CarDetailsPayment } from "@/components/car/car-details-payment"
import { VehicleSpecsBar } from "@/components/vehicle/vehicle-specs-bar"
import { Footer } from "@/components/footer"
import { FileSearch, Calendar, Clock, MapPin, Tag, Car, Truck } from "lucide-react"
import { Heart, Flag } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useState, useCallback, Suspense } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { submitOffer } from "@/lib/offers"
import { GoogleMapComponent } from "@/components/ui/google-map"
import { DetailItem } from "@/components/ui/detail-item"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
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
import { DealerRepository } from "@/lib/db/repositories/dealerRepository";
import { DealerProfile } from "@/lib/types/dealer";
import Image from "next/image";

// Helper function to safely format dates
const formatDate = (dateString?: string | Date | null): string | undefined => {
  if (!dateString) return undefined;
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString();
  } catch (e) {
    return undefined;
  }
};

const VehicleContent = ({ vehicle, userLocation, isFavorite, onFavoriteClick, user }: { 
  vehicle: Vehicle; 
  userLocation: { lat: number; lng: number } | null;
  isFavorite: boolean;
  onFavoriteClick: () => void;
  user: any;
}) => {
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(null);
  const [loadingDealer, setLoadingDealer] = useState(true);

  useEffect(() => {
    const fetchDealerProfile = async () => {
      if (!vehicle.dealerUid) {
        setLoadingDealer(false);
        return;
      }

      try {
        const dealerRepo = new DealerRepository();
        const profile = await dealerRepo.getDealerProfile(vehicle.dealerUid);
        console.log('Dealer profile fetched:', profile);
        setDealerProfile(profile);
      } catch (error) {
        console.error("Error fetching dealer profile:", error);
      } finally {
        setLoadingDealer(false);
      }
    };

    fetchDealerProfile();
  }, [vehicle.dealerUid]);

  const dealerInfo = {
    name: dealerProfile?.businessName || "Dealer information not available",
    location: dealerProfile?.city || vehicle.location.city,
    phoneNumber: dealerProfile?.phone || "Contact information not available",
    description: dealerProfile?.description || "Dealer description not available",
    email: dealerProfile?.email,
    logo: dealerProfile?.dealerLogoUrl || "/placeholder-logo.png", // was dealerLogoURL
    coverImage: dealerProfile?.dealerBannerUrl || "/banner/default-banner.jpg", // was dealerBannerURL
    website: dealerProfile?.website,
    socialMedia: dealerProfile?.socialMedia,
  };

  const carDetails = {
    carName: `${vehicle.make} ${vehicle.model}`,
    carDescription: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    price: `£${vehicle.price.toLocaleString()}`,
    dealerName: dealerInfo.name,
    dealerLocation: vehicle.location.city,
    saveButton: (
      <button 
        className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ml-2"
        onClick={onFavoriteClick}
        title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
      </button>
    )
  };

  // Offer modal state
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({ name: user?.displayName || "", email: user?.email || "", phone: "", offer: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferForm({ ...offerForm, [e.target.name]: e.target.value });
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitOffer(vehicle.id, {
        name: offerForm.name,
        email: offerForm.email,
        phone: offerForm.phone,
        offer: Number(offerForm.offer),
        uid: user?.uid || "",
      });
      setSubmitSuccess(true);
      setOfferForm({ name: user?.displayName || "", email: user?.email || "", phone: "", offer: "" });
    } catch (err) {
      setSubmitError("Failed to send offer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Make Offer button and dialog/modal
  const makeOfferButton = (
    <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
      <DialogTrigger asChild>
        <button className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" onClick={() => setOfferOpen(true)}>
          Make Offer
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>Submit your offer for this vehicle. The dealer will see your details and offer.</DialogDescription>
        </DialogHeader>
        {submitSuccess ? (
          <div className="text-green-600 py-4">Offer sent successfully!</div>
        ) : (
          <form className="space-y-4" onSubmit={handleOfferSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input type="text" name="name" value={offerForm.name} onChange={handleOfferChange} required className="w-full border rounded px-3 py-2" title="Name" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" value={offerForm.email} onChange={handleOfferChange} required className="w-full border rounded px-3 py-2" title="Email" placeholder="you@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" name="phone" value={offerForm.phone} onChange={handleOfferChange} required className="w-full border rounded px-3 py-2" title="Phone" placeholder="Phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Offer (£)</label>
              <input type="number" name="offer" value={offerForm.offer} onChange={handleOfferChange} required min="1" className="w-full border rounded px-3 py-2" title="Offer" placeholder="Your offer (£)" />
            </div>
            {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
            <DialogFooter>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" disabled={submitting}>
                {submitting ? "Sending..." : "Send Offer"}
              </button>
              <DialogClose asChild>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80">Cancel</button>
              </DialogClose>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );

  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // More Details section: show all fields except id, images, and the specified fields
  const excludedFields = [
    'id', 'images', 'deactivationReason', 'dateOfLastV5CIssued', 'tokenExpiryDate', 'tokenActivatedDate',
    'updatedAt', 'tokenStatus', 'createdAt', 'location', 'features', 'dealerUid', 'deactivatedAt', 'mot', 'registrationNumber', 'description', 'fuel'
  ];
  const moreDetails = Object.entries(vehicle)
    .filter(([key]) => !excludedFields.includes(key))
    .map(([key, value]) => (
      <tr key={key}>
        <td className="py-1 pr-4 font-mono text-xs text-gray-500 align-top">{key}</td>
        <td className="py-1 text-sm text-gray-900 align-top">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
      </tr>
    ));

  return (
    <>
      {/* Remove old Make Offer button groups (mobile/desktop) */}
      {/* CarImageSection for mobile */}
      <div className="lg:hidden mb-6">
        <Suspense fallback={<div>Loading images...</div>}>
          <CarImageSection images={vehicle.images} />
        </Suspense>
      </div>

      {/* CarDetailsPayment for mobile */}
      <div className="lg:hidden mb-6">
        <CarDetailsPayment 
          {...carDetails} 
          makeOfferButton={makeOfferButton}
          vehicleSpecs={{
            engineSize: vehicle.engineCapacity || 'N/A',
            mileage: vehicle.mileage ? Number(vehicle.mileage) : 0,
            fuelType: vehicle.fuel || 'N/A',
            transmission: vehicle.transmission || 'N/A'
          }}
        />
      </div>

      {/* Vehicle Description for mobile */}
      {vehicle.description && (
        <div className="lg:hidden mb-6">
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Description</h3>
            </div>
            <div className="p-4">
              <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">{vehicle.description}</p>
            </div>
          </Card>
        </div>
      )}
      {/* Enhanced Vehicle Details for mobile */}
      <div className="lg:hidden space-y-6">
        {/* Main Vehicle Info Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {/* Make */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Make</span>
                <span className="text-sm font-medium text-gray-900 uppercase">{vehicle.make}</span>
              </div>
              
              {/* Model */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Model</span>
                <span className="text-sm font-medium text-gray-900 uppercase">{vehicle.model}</span>
              </div>
              
              {/* Year */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Year</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.year}</span>
              </div>
              
              {/* Color */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Color</span>
                <span className="text-sm font-medium text-gray-900 uppercase">{vehicle.color}</span>
              </div>
              
              {/* Mileage */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Mileage</span>
                <span className="text-sm font-medium text-gray-900">
                  {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'N/A'}
                </span>
              </div>
              
              {/* Fuel Type */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Fuel Type</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.fuel || 'N/A'}</span>
              </div>
              
              {/* Transmission */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Transmission</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.transmission || 'N/A'}</span>
              </div>
              
              {/* Status */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.status}</span>
              </div>
              
              {/* Engine */}
              {vehicle.engineCapacity && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Engine</span>
                  <span className="text-sm font-medium text-gray-900">{vehicle.engineCapacity}</span>
                </div>
              )}
              
              {/* CO2 Emissions */}
              {vehicle.co2Emissions && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">CO2 Emissions</span>
                  <span className="text-sm font-medium text-gray-900">{vehicle.co2Emissions}g/km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documentation & Specifics Section */}
        <div className="space-y-6">
          {/* Documentation */}
          {(() => {
            // Helper function to check if a value is meaningful
            const hasValue = (value: any) => {
              if (value === undefined || value === null) return false;
              if (typeof value === 'string') {
                const trimmed = value.trim();
                return trimmed !== '' && !['N/A', 'n/a', 'Unknown', 'unknown', '-'].includes(trimmed);
              }
              return true;
            };

            // Check if we have any valid documentation values
            const hasValidDocs = 
              hasValue(vehicle.taxStatus) || 
              hasValue(vehicle.motStatus) || 
              hasValue(vehicle.euroStatus) || 
              (vehicle.dateOfLastV5CIssued && formatDate(vehicle.dateOfLastV5CIssued));

            return hasValidDocs ? (
              <Card className="overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Documentation</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {hasValue(vehicle.taxStatus) && <DetailItem label="Tax Status" value={vehicle.taxStatus} />}
                    {hasValue(vehicle.motStatus) && <DetailItem label="MOT Status" value={vehicle.motStatus} />}
                    {hasValue(vehicle.euroStatus) && <DetailItem label="Euro Status" value={vehicle.euroStatus} />}
                    {vehicle.dateOfLastV5CIssued && formatDate(vehicle.dateOfLastV5CIssued) && (
                      <DetailItem 
                        label="Last V5C Issued" 
                        value={formatDate(vehicle.dateOfLastV5CIssued)}
                      />
                    )}
                  </div>
                </div>
              </Card>
            ) : null;
          })()}

          {/* Vehicle Specific Details */}
          <VehicleSpecificDetails vehicle={vehicle} />
        </div>
        {/* Show More Details directly under Car Specifications */}
        <div className="mt-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setShowMoreDetails((open) => !open)}
            aria-expanded={showMoreDetails}
          >
            {showMoreDetails ? 'Hide' : 'Show'} More Details
            <span className={`transition-transform ${showMoreDetails ? 'rotate-180' : ''}`}>▼</span>
          </button>
          <div
            className={`transition-all duration-300 overflow-hidden ${showMoreDetails ? 'max-h-[1000px] mt-4' : 'max-h-0'}`}
            style={{ background: showMoreDetails ? '#fff' : 'transparent' }}
          >
            {showMoreDetails && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">More Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <tbody>
                      {moreDetails}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Dealer Information for mobile */}
        <DealerInformation {...dealerInfo} />
        {/* Vehicle Location Map for mobile */}
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
<div className="mt-2 mb-4 px-2">
  <p className="text-base text-gray-700 whitespace-pre-line">{vehicle.description}</p>
</div>
          <CommonVehicleDetails vehicle={vehicle} />
          <VehicleDocumentation vehicle={vehicle} />
          <VehicleSpecificDetails vehicle={vehicle} />
          {/* Show More Details directly under Car Specifications */}
          <div className="mt-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${showMoreDetails ? 'bg-gray-200' : ''}`}
              onClick={() => setShowMoreDetails((open) => !open)}
              aria-expanded={showMoreDetails ? "true" : "false"}
            >
              {showMoreDetails ? 'Hide' : 'Show'} More Details
              <span className={`transition-transform ${showMoreDetails ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden bg-transparent hover:bg-white ${showMoreDetails ? 'max-h-[1000px] mt-4' : 'max-h-0'}`}
            >
              {showMoreDetails && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">More Details</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <tbody>
                        {moreDetails}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Features Section */}
          {Array.isArray(vehicle.features) && vehicle.features.length > 0 && (
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
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5">
          {/* CarDetailsPayment for desktop - remains in right column, now with makeOfferButton and vehicleSpecs */}
          <div className="hidden lg:block">
            <CarDetailsPayment 
              {...carDetails} 
              makeOfferButton={makeOfferButton}
              vehicleSpecs={{
                engineSize: vehicle.engineCapacity || 'N/A',
                mileage: vehicle.mileage ? Number(vehicle.mileage) : 0,
                fuelType: vehicle.fuel || 'N/A',
                transmission: vehicle.transmission || 'N/A'
              }}
            />
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
            user={user}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 