"use client";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/vehicle-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useState, useEffect } from "react";
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { VehicleSummary, VehicleType } from "@/types/vehicles";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DealerData {
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
}

export default function BrowseVehiclesPage() {
  const [featuredVehicles, setFeaturedVehicles] = useState<VehicleSummary[]>([]);
  const [recentVehicles, setRecentVehicles] = useState<VehicleSummary[]>([]);
  const [dealers, setDealers] = useState<DealerData[]>([]);

  useEffect(() => {
    // Fetch vehicles
    const repository = new VehicleRepository();
    
    // Fetch featured vehicles
    repository.getAllVehicles().then((vehicles) => {
      setFeaturedVehicles(vehicles.slice(0, 4)); // Show first 4 vehicles
    });

    // Fetch recent vehicles
    repository.getAllVehicles().then((vehicles) => {
      // Sort by date added and take the most recent 4
      const sorted = [...vehicles].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentVehicles(sorted.slice(0, 4));
    });

    // Fetch dealers from Firestore
    const fetchDealers = async () => {
      try {
        const dealersRef = collection(db, 'dealers');
        const q = query(dealersRef, limit(3)); // Limit to 3 featured dealers
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
          } as DealerData;
        });

        setDealers(dealersData);
      } catch (error) {
        console.error("Error fetching dealers:", error);
      }
    };

    fetchDealers();
  }, []);

  const DealerCard = ({ id, businessName, dealerBannerUrl, contact, location }: DealerData) => {
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
              <p className="truncate">{location.addressLines.filter(line => line && line.trim()).join(", ")}</p>
              <p className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-400" /> {contact.phone || "Not available"}
              </p>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white pointer-events-none">
              Contact Dealer
            </Button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section with Search */}
        <section className="w-full">
          <Hero />
        </section>

      {/* Category Navigation */}
      <section className="container mx-auto py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-3 text-center">Browse by Category</h2>
          <p className="text-gray-600 text-center mb-12">Find your perfect vehicle from our wide range of categories</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/categories/cars" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l2-2h10l2 2m0 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m12 0l-2-3H7L5 10m0 0h14M7 14h.01M17 14h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Cars</h3>
                <p className="text-gray-600 text-sm text-center">Explore our selection of cars, from economy to luxury</p>
              </div>
            </Link>

            <Link href="/categories/vans" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-green-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Vans</h3>
                <p className="text-gray-600 text-sm text-center">Find the perfect van for your business or personal use</p>
              </div>
            </Link>

            <Link href="/categories/trucks" className="group">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
                <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-orange-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Trucks</h3>
                <p className="text-gray-600 text-sm text-center">Browse our range of commercial and heavy-duty trucks</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="container mx-auto py-12 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8">Vehicles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVehicles.slice(0, 4).map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              view="grid"
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/search">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              View All Vehicles
            </Button>
          </Link>
        </div>
      </section>
          

      {/* Trusted Dealers Section */}
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Trusted Dealers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealers.map((dealer) => (
            <DealerCard
              key={dealer.id}
              {...dealer}
            />
          ))}
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
