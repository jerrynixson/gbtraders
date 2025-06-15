"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VehicleCard } from "@/components/vehicle-card";
import { useEffect, useState } from "react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useParams } from "next/navigation";

type DealerData = {
  businessName: string;
  dealerBanner: string;
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

export default function DealerInfoPage() {
  const params = useParams();
  const [dealer, setDealer] = useState<DealerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        const dealerId = params.id as string;
        const dealerRef = doc(db, 'dealers', dealerId);
        const dealerDoc = await getDoc(dealerRef);
        
        if (dealerDoc.exists()) {
          setDealer(dealerDoc.data() as DealerData);
        } else {
          console.error('Dealer not found');
        }
      } catch (error) {
        console.error('Error fetching dealer:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDealer();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading dealer information...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Dealer not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Main Info */}
        <div className="flex-1 bg-white/70 rounded-3xl shadow-xl p-8">
          <div className="w-full h-72 relative mb-6">
            <Image
              src={dealer.dealerBanner || "/placeholder.svg"}
              alt={dealer.businessName}
              fill
              className="object-contain bg-white rounded-2xl"
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{dealer.businessName}</h1>
          <div className="flex items-center text-blue-700 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            {dealer.location.addressLines.join(", ")}
          </div>
          {dealer.rating && (
            <div className="flex items-center mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`h-5 w-5 inline-block ${i < Math.round(dealer.rating || 0) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
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
            <p><span className="font-medium">Monday to Friday:</span> {dealer.businessHours.mondayToFriday}</p>
            <p><span className="font-medium">Saturday:</span> {dealer.businessHours.saturday}</p>
            <p><span className="font-medium">Sunday:</span> {dealer.businessHours.sunday}</p>
          </div>
        </div>
        {/* Right: Contact & Map */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
            <Button className="w-full mb-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
              <Phone className="mr-2" /> Call {dealer.contact.phone}
            </Button>
            <Button variant="outline" className="w-full mb-3">
              Send Email
            </Button>
            {dealer.contact.website && (
              <Button variant="outline" className="w-full mb-3" asChild>
                <Link href={dealer.contact.website} target="_blank">Visit Website</Link>
              </Button>
            )}
          </div>
          <div className="bg-white/80 rounded-3xl shadow-lg p-4">
            {/* Replace with real map if available */}
            <div className="w-full h-48 bg-gray-200 rounded-2xl flex items-center justify-center text-blue-400">
              Map Placeholder
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 