"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Instagram, Facebook, Twitter, Linkedin, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VehicleCard } from "@/components/vehicle-card";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { getDealerListings } from "@/lib/firebase";

type DealerData = {
  businessName: string;
  dealerBanner?: string;
  dealerBannerUrl?: string;
  dealerLogoUrl?: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  location: {
    addressLines: string[];
    lat: number;
    long: number;
  };
  description: string;
  specialties?: string[];
  rating?: number;
  businessHours: {
    mondayToFriday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia?: string[];
};

// Dynamically import GoogleMap component (if you have one, else fallback to static map)
const GoogleMapComponent = dynamic(() => import("@/components/ui/google-map").then(mod => mod.GoogleMapComponent), { 
  ssr: false, 
  loading: () => <div className="w-full h-48 flex items-center justify-center text-blue-400">Loading map...</div> 
});

// Copy DealerCard from dealers list page
function DealerCard({ id, businessName, dealerBanner, dealerBannerUrl, contact, location }: any) {
  const banner = dealerBannerUrl || dealerBanner || "/placeholder.svg";
  return (
    <Link href={`/categories/dealers/${id}`} className="block group cursor-pointer">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all hover:shadow-lg">
        <div className="relative">
          <Image
            src={banner}
            alt={businessName}
            width={400}
            height={250}
            className="w-full h-48 object-contain bg-white"
            onError={(e: any) => { e.target.src = "/placeholder.svg"; }}
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{businessName}</h3>
            <span className="text-sm text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" /> {location?.addressLines?.[0]}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1 mb-4">
            <p className="truncate">{location?.addressLines?.join(", ")}</p>
            <p className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {contact?.phone}
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

export default function DealerInfoPage() {
  const params = useParams();
  const [dealer, setDealer] = useState<DealerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreDealers, setMoreDealers] = useState<any[]>([]);
  const [dealerVehicles, setDealerVehicles] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        setError(null);
        const dealerId = params.id as string;
        const dealerRef = doc(db, 'dealers', dealerId);
        const dealerDoc = await getDoc(dealerRef);
        if (dealerDoc.exists()) {
          setDealer(dealerDoc.data() as DealerData);
        } else {
          setError('Dealer not found');
        }
      } catch (error) {
        setError('Error fetching dealer information.');
        console.error('Error fetching dealer:', error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchDealer();
    }
  }, [params.id]);

  useEffect(() => {
    // Fetch more dealers nearby
    const fetchMoreDealers = async () => {
      try {
        const dealersRef = collection(db, 'dealers');
        const snapshot = await getDocs(dealersRef);
        let allDealers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Remove current dealer
        allDealers = allDealers.filter((d: any) => d.id !== params.id);
        // If lat/long available, sort by distance
        if (dealer && dealer.location?.lat && dealer.location?.long) {
          allDealers = allDealers.map((d: any) => {
            if (d.location?.lat && d.location?.long) {
              const dx = d.location.lat - dealer.location.lat;
              const dy = d.location.long - dealer.location.long;
              d._distance = Math.sqrt(dx*dx + dy*dy);
            } else {
              d._distance = Infinity;
            }
            return d;
          }).sort((a: any, b: any) => a._distance - b._distance);
        } else {
          // Otherwise randomize
          allDealers = allDealers.sort(() => Math.random() - 0.5);
        }
        setMoreDealers(allDealers.slice(0, 3));
      } catch (e) {
        setMoreDealers([]);
      }
    };
    if (dealer) fetchMoreDealers();
  }, [dealer, params.id]);

  useEffect(() => {
    // Fetch dealer's vehicles
    const fetchDealerVehicles = async () => {
      try {
        setVehiclesLoading(true);
        const vehicles = await getDealerListings(params.id as string);
        setDealerVehicles(vehicles);
      } catch (error) {
        console.error('Error fetching dealer vehicles:', error);
        setDealerVehicles([]);
      } finally {
        setVehiclesLoading(false);
      }
    };
    if (params.id) {
      fetchDealerVehicles();
    }
  }, [params.id]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);
  
  // Debug map coordinates
  useEffect(() => {
    if (dealer?.location) {
      console.log("Dealer coordinates:", {
        lat: dealer.location.lat,
        lng: dealer.location.long,
        type: {
          lat: typeof dealer.location.lat,
          long: typeof dealer.location.long
        }
      });
    }
    
    // Check for Google Maps API Key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("Google Maps API Key available:", !!apiKey);
  }, [dealer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-4" aria-label="Loading" />
          <div className="text-center text-blue-900 font-medium">Loading dealer information...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center text-red-600 font-semibold">{error || 'Dealer not found'}</div>
          <Link href="/categories/dealers" className="mt-4 text-blue-700 underline">Back to Dealers</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Helper for website link
  const getWebsiteUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  // Helper for social icons (proper SVG icons)
  const getSocialIcon = (url: string) => {
    if (url.includes("facebook")) return <Facebook className="h-6 w-6" />;
    if (url.includes("twitter")) return <Twitter className="h-6 w-6" />;
    if (url.includes("instagram")) return <Instagram className="h-6 w-6" />;
    if (url.includes("linkedin")) return <Linkedin className="h-6 w-6" />;
    return <Globe className="h-6 w-6" />;
  };
  
  // Helper to extract domain name from URL for displaying as label
  const getSocialDomain = (url: string): string => {
    try {
      // Check for common social media platforms first
      if (url.includes("facebook")) return "Facebook";
      if (url.includes("twitter") || url.includes("x.com")) return "Twitter";
      if (url.includes("instagram")) return "Instagram";
      if (url.includes("linkedin")) return "LinkedIn";
      if (url.includes("youtube")) return "YouTube";
      if (url.includes("tiktok")) return "TikTok";
      if (url.includes("pinterest")) return "Pinterest";
      
      // Remove protocol if it exists
      let domain = url.replace(/^(https?:\/\/)?(www\.)?/i, '');
      
      // Split by first slash to get just the domain part
      domain = domain.split('/')[0];
      
      // For other domains, try to get the second-level domain
      const parts = domain.split('.');
      if (parts.length >= 2) {
        const sld = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        return sld || "Website";
      }
      
      // If we couldn't extract a proper domain name, return "Website"
      return domain || "Website";
    } catch (e) {
      return "Website";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Main Info */}
        <div className="flex-1 bg-white/70 rounded-3xl shadow-xl p-8">
          <div className="w-full h-72 relative mb-6">
            <Image
              src={dealer.dealerBannerUrl || dealer.dealerBanner || "/placeholder.svg"}
              alt={dealer.businessName + " banner"}
              fill
              className="object-contain bg-white rounded-2xl"
              style={{ objectFit: "contain" }}
              onError={(e: any) => { e.target.src = "/placeholder.svg"; }}
            />
            {/* Logo overlay on the left side */}
            {dealer.dealerLogoUrl && (
              <div className="absolute top-12 left-4 z-10">
                <div className="w-32 h-32 bg-white rounded-xl shadow-lg p-2 border border-gray-200">
                  <Image
                    src={dealer.dealerLogoUrl}
                    alt={dealer.businessName + " logo"}
                    width={112}
                    height={112}
                    className="w-full h-full object-contain"
                    onError={(e: any) => { e.target.src = "/placeholder.svg"; }}
                  />
                </div>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{dealer.businessName}</h1>
          <div className="flex items-center text-blue-700 mb-4">
            <MapPin className="h-5 w-5 mr-2" aria-label="Location" />
            {dealer.location.addressLines.join(", ")}
          </div>
          {dealer.rating !== undefined && (
            <div className="flex items-center mb-4" aria-label={`Rating: ${dealer.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(dealer.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} aria-hidden />
              ))}
              <span className="ml-2 text-blue-900 font-semibold">{dealer.rating}/5</span>
            </div>
          )}
          {dealer.specialties && dealer.specialties.length > 0 && (
            <div className="mb-4">
              <h2 className="font-semibold text-blue-800 mb-2">Specialties</h2>
              <ul className="flex flex-wrap gap-2">
                {dealer.specialties.map((s, i) => (
                  <li
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-gray-700 mb-6">{dealer.description}</p>
          <div className="space-y-2 text-gray-700">
            <h2 className="font-semibold text-blue-800 mb-2">Business Hours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <p><span className="font-medium">Monday to Friday:</span> {dealer.businessHours.mondayToFriday}</p>
              <p><span className="font-medium">Saturday:</span> {dealer.businessHours.saturday}</p>
              <p><span className="font-medium">Sunday:</span> {dealer.businessHours.sunday}</p>
            </div>
          </div>
        </div>
        {/* Right: Contact & Map */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
            <a href={`tel:${dealer.contact.phone}`} className="w-full mb-3">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold" aria-label={`Call ${dealer.contact.phone}`}>
                <Phone className="mr-2" /> Call {dealer.contact.phone}
              </Button>
            </a>
            <a href={`mailto:${dealer.contact.email}`} className="w-full mb-3">
              <Button variant="outline" className="w-full" aria-label="Send Email">
                Send Email
              </Button>
            </a>
            {dealer.contact.website && (
              <Button variant="outline" className="w-full mb-3" asChild>
                <Link href={getWebsiteUrl(dealer.contact.website) || "#"} target="_blank" rel="noopener noreferrer" aria-label="Visit Website">Visit Website</Link>
              </Button>
            )}
          </div>
          <div className="bg-white/80 rounded-3xl shadow-lg p-4">
            {dealer.location && typeof dealer.location.lat === 'number' && typeof dealer.location.long === 'number' ? (
              <>
                <div className="relative">
                  <GoogleMapComponent
                    center={{ lat: dealer.location.lat, lng: dealer.location.long }}
                    zoom={13}
                    height="250px"
                    markers={[
                      // Dealer location marker
                      { 
                        position: { lat: dealer.location.lat, lng: dealer.location.long }, 
                        title: dealer.businessName,
                        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }
                      },
                      // User location marker (if available)
                      ...(userLocation ? [{
                        position: userLocation,
                        title: "Your Location",
                        icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
                      }] : [])
                    ]}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-gray-600">Dealer Location</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-gray-600">Your Location</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-2xl flex items-center justify-center text-blue-400">
                <span>Map not available</span>
              </div>
            )}
          </div>
          {dealer.socialMedia && dealer.socialMedia.length > 0 && (
            <div className="bg-white/80 rounded-3xl shadow-lg p-6">
              <h2 className="font-semibold text-blue-800 mb-4 text-center">Connect with us</h2>
              <div className="flex flex-wrap justify-center gap-6">
                {dealer.socialMedia.map((url, i) => {
                  const socialName = getSocialDomain(url);
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <Link 
                        href={getWebsiteUrl(url) || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        aria-label={socialName}
                        className="group flex flex-col items-center"
                      >
                        <div className="p-2 rounded-full bg-blue-50 mb-2 hover:bg-blue-100 transition-colors">
                          {getSocialIcon(url)}
                        </div>
                        <span className="text-xs font-medium text-blue-700">
                          {socialName || "Website"}
                        </span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Dealer's Vehicles Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Cars Listed by This Dealer</h2>
        {vehiclesLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <div className="text-gray-600">Loading vehicles...</div>
          </div>
        ) : dealerVehicles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No vehicles currently listed by this dealer.</div>
            <p className="text-sm text-gray-400">Check back later for new listings!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealerVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
      {/* More Dealers Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">More Dealers Nearby</h2>
        {moreDealers.length === 0 ? (
          <div className="text-gray-500">No other dealers found nearby.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {moreDealers.map((d) => (
              <DealerCard key={d.id} {...d} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 