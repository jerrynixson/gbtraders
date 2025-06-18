"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Filter, Grid, List, Phone } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GoogleMapComponent } from "@/components/ui/google-map";
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DealerLocation {
  lat: number;
  long: number;
  addressLines: [string, string, string];
}

type DealerData = {
  id: string;
  businessName: string;
  dealerBannerUrl: string;
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  location: {
    addressLines: string[];
    lat: number;
    long: number;
  };
  businessHours: {
    mondayToFriday?: string;
    saturday?: string;
    sunday?: string;
  };
  description: string;
  specialties: string[];
  rating: number;
  socialMedia: string[];
};

function DealerCard({ id, businessName, dealerBannerUrl, contact, location }: DealerData) {
  return (
    <Link href={`/categories/dealers/${id}`} className="block group cursor-pointer">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all hover:shadow-lg">
        <div className="relative">
          <Image
            src={dealerBannerUrl || "/placeholder.svg"}
            alt={businessName}
            width={400}
            height={250}
            className="w-full h-48 object-contain bg-white"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{businessName}</h3>
            <span className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {location.addressLines[0]}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1 mb-4">
            <p className="truncate">{location.addressLines.join(", ")}</p>
            <p className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {contact.phone}
            </p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white pointer-events-none">
            Contact Dealer
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Add this function to convert address to coordinates
const getCoordinatesFromAddress = async (addressLines: string[]): Promise<{ lat: number; lng: number }> => {
  try {
    const address = addressLines.join(", ");
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
    throw new Error('No results found');
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return { lat: 0, lng: 0 };
  }
};

export default function SearchDealerPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("rating");
  const [dealers, setDealers] = useState<DealerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true);
        const dealersRef = collection(db, 'dealers');
        const q = query(dealersRef);
        const querySnapshot = await getDocs(q);
        
        const dealersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            businessName: data.businessName || '',
            dealerBannerUrl: data.dealerBannerUrl || '',
            contact: data.contact || {},
            location: data.location || { addressLines: [], lat: 0, long: 0 },
            businessHours: data.businessHours || {},
            description: data.description || '',
            specialties: data.specialties || [],
            rating: data.rating || 0,
            socialMedia: data.socialMedia || []
          };
        });

        // Get search query from URL
        const searchParams = new URLSearchParams(window.location.search);
        const searchQuery = searchParams.get('q')?.toLowerCase() || '';
        const locationQuery = searchParams.get('location')?.toLowerCase() || '';

        // Filter dealers based on search query
        const filteredDealers = dealersData.filter(dealer => {
          const matchesSearch = searchQuery ? 
            dealer.businessName.toLowerCase().includes(searchQuery) ||
            dealer.specialties.some((specialty: string) => specialty.toLowerCase().includes(searchQuery)) ||
            dealer.description.toLowerCase().includes(searchQuery) : true;

          const matchesLocation = locationQuery ?
            dealer.location.addressLines.some((line: string) => line.toLowerCase().includes(locationQuery)) : true;

          return matchesSearch && matchesLocation;
        });

        setDealers(filteredDealers);
      } catch (error) {
        console.error('Error fetching dealers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  const calculateMapCenter = () => {
    if (userLocation) {
      return userLocation;
    }

    // If no user location, center on first dealer with valid coordinates
    const validDealer = dealers.find(dealer => dealer.location.lat !== 0 && dealer.location.long !== 0);
    if (validDealer) {
      return { lat: validDealer.location.lat, lng: validDealer.location.long };
    }

    // Default to London if no valid coordinates
    return { lat: 51.5074, lng: -0.1278 };
  };

  // Create markers for map
  const markers = [
    // User location marker
    ...(userLocation ? [{
      position: userLocation,
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
      title: 'Your Location'
    }] : []),
    // Dealer markers
    ...dealers
      .filter(dealer => dealer.location.lat !== 0 && dealer.location.long !== 0)
      .map(dealer => ({
        position: { lat: dealer.location.lat, lng: dealer.location.long },
        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
        title: dealer.businessName
      }))
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        {/* Search Section */}
        <div className="flex justify-center items-center py-4 mb-2">
          <div className="w-full max-w-4xl flex rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-blue-200 relative">
            <div className="w-2 h-full bg-gradient-to-b from-blue-400 to-blue-700 rounded-l-3xl"></div>
            <form className="flex flex-col md:flex-row flex-1 gap-3 md:gap-4 p-4 md:p-6 items-stretch md:items-end">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <label htmlFor="dealer-search" className="block text-xs font-semibold text-blue-900 mb-1 tracking-widest uppercase">Dealer</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                  <Input
                    id="dealer-search"
                    placeholder="e.g. Best Cars Ltd"
                    className="pl-12 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder-blue-400 h-12"
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <label htmlFor="location-search" className="block text-xs font-semibold text-blue-900 mb-1 tracking-widest uppercase">Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                  <Input
                    id="location-search"
                    placeholder="e.g. Manchester"
                    className="pl-12 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder-blue-400 h-12"
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <label htmlFor="service-filter" className="block text-xs font-semibold text-blue-900 mb-1 tracking-widest uppercase">Service</label>
                <div className="relative group">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                  <select
                    id="service-filter"
                    className="w-full pl-12 pr-4 py-2.5 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 h-12"
                  >
                    <option value="">All Services</option>
                    <option value="used-cars">Used Cars</option>
                    <option value="financing">Financing</option>
                    <option value="warranty">Warranty</option>
                  </select>
                </div>
              </div>
              
              <Button
                type="submit"
                className="rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold px-8 h-12 shadow-lg hover:scale-105 transition-transform duration-200 w-full md:w-auto"
              >
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Map and Listings */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Map */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Find Dealers Near You</h2>
                <div className="w-full h-[300px] rounded-2xl overflow-hidden">
                  <GoogleMapComponent
                    center={calculateMapCenter()}
                    zoom={12}
                    markers={markers}
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <img
                      src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      alt="User location"
                      className="w-4 h-4 mr-2"
                    />
                    <span>Your Location</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <img
                      src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                      alt="Dealer location"
                      className="w-4 h-4 mr-2"
                    />
                    <span>Dealer Location</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Listings */}
            <div className="lg:w-2/3">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-gray-600">
                    {loading ? 'Loading dealers...' : `Showing ${dealers.length} dealers`}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "grid" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "list" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                    >
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px]"
                  >
                    <option value="rating">Rating</option>
                    <option value="distance">Distance</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading dealers...</div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dealers.map((dealer) => (
                    <DealerCard key={dealer.id} {...dealer} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {dealers.map((dealer) => (
                    <div key={dealer.id} className="flex bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="w-64 h-48 flex-shrink-0 relative">
                        <Image 
                          src={dealer.dealerBannerUrl || "/placeholder.svg"} 
                          alt={dealer.businessName} 
                          fill 
                          className="object-contain bg-white rounded-l-xl" 
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{dealer.businessName}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            {dealer.location.addressLines.join(', ')}
                          </p>
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-blue-500" />
                            {dealer.contact.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

