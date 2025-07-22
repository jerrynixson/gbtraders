"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Grid, List, Phone, ChevronLeft, ChevronRight, X } from "lucide-react";
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

// Cache for dealers data
const DEALERS_CACHE_KEY = 'cached_dealers';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

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
  const [dealers, setDealers] = useState<DealerData[]>([]);
  const [filteredDealers, setFilteredDealers] = useState<DealerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const dealersPerPage = 12;

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

  // Search filtering effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDealers(dealers);
      setCurrentPage(1); // Reset to first page when clearing search
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = dealers.filter(dealer => {
      const matchesName = dealer.businessName.toLowerCase().includes(query);
      const matchesLocation = dealer.location.addressLines.some((line: string) => 
        line.toLowerCase().includes(query)
      );
      const matchesSpecialties = dealer.specialties.some((specialty: string) => 
        specialty.toLowerCase().includes(query)
      );
      const matchesDescription = dealer.description.toLowerCase().includes(query);

      return matchesName || matchesLocation || matchesSpecialties || matchesDescription;
    });

    setFilteredDealers(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, dealers]);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cachedData = localStorage.getItem(DEALERS_CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME;
          
          if (!isExpired) {
            setDealers(data);
            setFilteredDealers(data);
            setLoading(false);
            return;
          }
        }
        
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

        // Cache the data
        localStorage.setItem(DEALERS_CACHE_KEY, JSON.stringify({
          data: dealersData,
          timestamp: Date.now()
        }));

        setDealers(dealersData);
        setFilteredDealers(dealersData);
      } catch (error) {
        console.error('Error fetching dealers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(filteredDealers.length / dealersPerPage);
  const startIndex = (currentPage - 1) * dealersPerPage;
  const endIndex = startIndex + dealersPerPage;
  const currentDealers = filteredDealers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results when page changes
    document.querySelector('.lg\\:w-2\\/3')?.scrollIntoView({ behavior: 'smooth' });
  };

  const calculateMapCenter = () => {
    if (userLocation) {
      return userLocation;
    }

    // If no user location, center on first dealer with valid coordinates from current page
    const validDealer = currentDealers.find(dealer => dealer.location.lat !== 0 && dealer.location.long !== 0);
    if (validDealer) {
      return { lat: validDealer.location.lat, lng: validDealer.location.long };
    }

    // Fallback to any dealer with valid coordinates
    const anyValidDealer = filteredDealers.find(dealer => dealer.location.lat !== 0 && dealer.location.long !== 0);
    if (anyValidDealer) {
      return { lat: anyValidDealer.location.lat, lng: anyValidDealer.location.long };
    }

    // Default to London if no valid coordinates
    return { lat: 51.5074, lng: -0.1278 };
  };

  // Create markers for map - show all filtered dealers, not just current page
  const markers = [
    // User location marker
    ...(userLocation ? [{
      position: userLocation,
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
      title: 'Your Location'
    }] : []),
    // Dealer markers - highlight current page dealers differently
    ...filteredDealers
      .filter(dealer => dealer.location.lat !== 0 && dealer.location.long !== 0)
      .map(dealer => {
        const isOnCurrentPage = currentDealers.some(currentDealer => currentDealer.id === dealer.id);
        return {
          position: { lat: dealer.location.lat, lng: dealer.location.long },
          icon: { 
            url: isOnCurrentPage 
              ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              : 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png'
          },
          title: dealer.businessName
        };
      })
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        {/* Search Section */}
        <div className="flex justify-center items-center py-4 mb-2">
          <div className="w-full max-w-2xl flex rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-blue-200 relative">
            <div className="w-2 h-full bg-gradient-to-b from-blue-400 to-blue-700 rounded-l-3xl"></div>
            <div className="flex-1 p-4 md:p-6">
              <label htmlFor="dealer-search" className="block text-xs font-semibold text-blue-900 mb-2 tracking-widest uppercase">Search Dealers</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-200 h-5 w-5" />
                <Input
                  id="dealer-search"
                  placeholder="Search by dealer name, location, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 py-3 rounded-full bg-white/80 border border-blue-200 shadow focus:ring-2 focus:ring-blue-400 text-blue-900 placeholder-blue-400 h-12 text-base"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
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
                      alt="Current page dealers"
                      className="w-4 h-4 mr-2"
                    />
                    <span>Current Page Dealers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <img
                      src="http://maps.google.com/mapfiles/ms/icons/pink-dot.png"
                      alt="Other dealers"
                      className="w-4 h-4 mr-2"
                    />
                    <span>Other Dealers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Listings */}
            <div className="lg:w-2/3">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-gray-600">
                    {loading ? 'Loading dealers...' : 
                      `Showing ${startIndex + 1}-${Math.min(endIndex, filteredDealers.length)} of ${filteredDealers.length} dealers`
                    }
                    {dealers.length !== filteredDealers.length && (
                      <span className="text-sm text-gray-500 ml-1">
                        (filtered from {dealers.length} total)
                      </span>
                    )}
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
                      className={`hidden md:flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "list" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                    >
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading dealers...</div>
              ) : filteredDealers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? `No dealers found matching "${searchQuery}"` : 'No dealers available'}
                </div>
              ) : viewMode === "grid" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentDealers.map((dealer) => (
                      <DealerCard key={dealer.id} {...dealer} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] ${
                              currentPage === page 
                                ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" 
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    {currentDealers.map((dealer) => (
                      <div key={dealer.id} className="flex flex-col md:flex-row bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="w-full md:w-64 h-48 flex-shrink-0 relative">
                          <Image 
                            src={dealer.dealerBannerUrl || "/placeholder.svg"} 
                            alt={dealer.businessName} 
                            fill 
                            className="object-contain bg-white" 
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
                  
                  {/* Pagination for List View */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] ${
                              currentPage === page 
                                ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" 
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

