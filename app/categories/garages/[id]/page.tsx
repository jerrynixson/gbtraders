"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Globe, Mail, Facebook, Twitter, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GoogleMapComponent } from "@/components/ui/google-map";
import { getGarageById, getAllPublicGarages } from "@/lib/garage";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { type Garage } from "@/lib/types/garage";

interface GaragePageProps {
  params: { id: string };
}

export default function GarageInfoPage({ params }: GaragePageProps) {
  const [garage, setGarage] = useState<Garage | null>(null);
  const [relatedGarages, setRelatedGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGarageData = async () => {
      try {
        setLoading(true);
        
        // Fetch garage data
        const garageData = await getGarageById(params.id);
        
        if (!garageData || !garageData.isActive) {
          notFound();
          return;
        }

        setGarage(garageData);

        // Fetch related garages
        const allGarages = await getAllPublicGarages();
        const related = allGarages
          .filter(g => g.id !== garageData.id && g.isActive)
          .slice(0, 3);
        setRelatedGarages(related);

      } catch (err) {
        console.error('Error loading garage data:', err);
        setError('Failed to load garage data');
      } finally {
        setLoading(false);
      }
    };

    loadGarageData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading garage information...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !garage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            {error || "Garage not found"}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden sm:overflow-x-visible">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Main Info (2/3 width) */}
        <div className="flex-1 bg-white/70 rounded-3xl shadow-xl p-8">
          {/* Cover Image with overlaid main image (logo/photo) */}
          <div className="w-full h-72 relative mb-6">
            <Image
              src={garage.coverImage || garage.image || '/placeholder.jpg'}
              alt={`${garage.name} cover`}
              fill
              className="object-contain bg-white rounded-2xl"
              style={{ objectFit: "contain" }}
            />
            {/* Main image overlay */}
            {garage.image && (
              <div className="absolute top-12 left-4 z-10">
                <div className="w-32 h-32 bg-white rounded-xl shadow-lg p-2 border border-gray-200 flex items-center justify-center">
                  <Image
                    src={garage.image}
                    alt={`${garage.name} main`}
                    width={112}
                    height={112}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 mb-6 flex-wrap sm:flex-nowrap">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold"
              onClick={() => window.open(`mailto:${garage.email}`, '_self')}
            >
              <Mail className="mr-2" /> Mail
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold"
              as={garage.website ? 'a' : 'button'}
              href={garage.website || undefined}
              target={garage.website ? '_blank' : undefined}
              rel={garage.website ? 'noopener noreferrer' : undefined}
              disabled={!garage.website}
            >
              <Globe className="mr-2" /> Website
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold"
              onClick={() => window.open(`tel:${garage.phone}`, '_self')}
            >
              <Phone className="mr-2" /> Call
            </Button>
          </div>

          {/* Garage Info */}
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{garage.name}</h1>
          <div className="flex items-center text-blue-700 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            {garage.address}
          </div>
          {/* Rating (temporarily disabled)
          <div className="flex items-center mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(garage.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
              />
            ))}
            <span className="ml-2 text-blue-900 font-semibold">{garage.rating || 0}/5</span>
          </div>
          */}

          {/* Business Overview */}
          <div className="mb-6">
            <h2 className="font-semibold text-blue-800 mb-3">Business Overview</h2>
            <p className="text-gray-700">{garage.description || 'No description available'}</p>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h2 className="font-semibold text-blue-800 mb-3">Products & Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(garage.services || []).map((service, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sidebar (1/3 width) */}
        <div className="lg:w-1/3 space-y-6">
          {/* Map Card */}
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-4">
              <GoogleMapComponent 
                center={{ lat: 52.4862, lng: -1.8904 }}
                zoom={13}
              />
            </div>
          </div>

          {/* Rating Summary (temporarily disabled)
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <h2 className="font-semibold text-blue-800 mb-3">Rating Summary</h2>
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(garage.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                />
              ))}
              <span className="ml-2 text-blue-900 font-semibold">{garage.rating || 0}/5</span>
            </div>
          </div>
          */}

          {/* Opening Hours */}
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <h2 className="font-semibold text-blue-800 mb-3">Opening Hours</h2>
            <div className="space-y-2">
              <p className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>Monday - Friday: {garage.openingHours?.weekdays?.start || '09:00'} - {garage.openingHours?.weekdays?.end || '17:00'}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>Saturday: {garage.openingHours?.saturday?.start || '09:00'} - {garage.openingHours?.saturday?.end || '17:00'}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>Sunday: {garage.openingHours?.sunday?.start || '10:00'} - {garage.openingHours?.sunday?.end || '16:00'}</span>
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <h2 className="font-semibold text-blue-800 mb-3">Payment Methods</h2>
            <div className="flex flex-wrap gap-2">
              {(garage.paymentMethods || ['Cash', 'Card']).map((method, i) => (
                <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <h2 className="font-semibold text-blue-800 mb-3">Social Media</h2>
            <div className="flex gap-4">
              {garage.socialMedia?.facebook && (
                <a href={garage.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {garage.socialMedia?.twitter && (
                <a href={garage.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {garage.socialMedia?.instagram && (
                <a href={garage.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Listings */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Related Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedGarages.map((relatedGarage) => (
            <div key={relatedGarage.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 relative">
                <Image 
                  src={relatedGarage.image || '/placeholder.jpg'} 
                  alt={relatedGarage.name} 
                  fill 
                  className="object-cover rounded-t-xl" 
                  style={{ objectFit: "cover" }} 
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{relatedGarage.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {relatedGarage.address || 'Location not specified'}
                </div>
                {/* Rating in card (temporarily disabled)
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < Math.round(relatedGarage.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                  <span className="ml-2 text-gray-700 font-medium">{relatedGarage.rating || 0}/5</span>
                </div>
                */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {(relatedGarage.services || []).slice(0, 3).map((service, k) => (
                    <span key={k} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{service}</span>
                  ))}
                  {(relatedGarage.services || []).length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                      +{(relatedGarage.services || []).length - 3} more
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Address:</span> {relatedGarage.address || 'Address not available'}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Phone:</span> {relatedGarage.phone || 'Phone not available'}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Hours:</span> Mon-Fri: {relatedGarage.openingHours?.weekdays?.start || '09:00'}-{relatedGarage.openingHours?.weekdays?.end || '17:00'}
                </div>
                <div className="flex justify-end mt-auto">
                  <Link href={`/categories/garages/${relatedGarage.id}`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
