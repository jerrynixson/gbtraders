"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  CreditCard,
  Facebook,
  Twitter,
  Instagram,
  CheckCircle,
  Share2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getGarageById } from "@/lib/garage";

interface Garage {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  description: string;
  services: string[];
  phone: string;
  email: string;
  website: string;
  openingHours: {
    weekdays: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  paymentMethods: string[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  price: string;
  ownerId: string;
  isActive: boolean;
}

export default function GarageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGarage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!params.id || typeof params.id !== 'string') {
          setError('Invalid garage ID');
          return;
        }

        const garageData = await getGarageById(params.id);
        
        if (!garageData) {
          setError('Garage not found');
          return;
        }

        setGarage(garageData);
      } catch (error) {
        console.error('Error loading garage:', error);
        setError('Failed to load garage details');
      } finally {
        setLoading(false);
      }
    };

    loadGarage();
  }, [params.id]);

  const shareGarage = async () => {
    if (navigator.share && garage) {
      try {
        await navigator.share({
          title: garage.name,
          text: garage.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-64 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 w-1/2 rounded"></div>
              <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
              <div className="bg-gray-300 h-4 w-1/2 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !garage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Garage not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The garage you're looking for might have been removed or doesn't exist.
            </p>
            <Link href="/categories/garages">
              <Button>Back to Garages</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb & Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <nav className="text-sm text-gray-500">
            <Link href="/categories" className="hover:text-gray-700">Categories</Link>
            <span className="mx-2">/</span>
            <Link href="/categories/garages" className="hover:text-gray-700">Garages</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{garage.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src={garage.image}
                alt={garage.name}
                width={800}
                height={400}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                  {garage.price}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={shareGarage}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{garage.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{garage.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-600">• Premium Garage</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                  <span className="text-gray-700">{garage.address}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{garage.description}</p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {garage.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Monday - Friday</span>
                    <span className="text-gray-600">
                      {garage.openingHours.weekdays.start} - {garage.openingHours.weekdays.end}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Saturday</span>
                    <span className="text-gray-600">
                      {garage.openingHours.saturday.start} - {garage.openingHours.saturday.end}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-700">Sunday</span>
                    <span className="text-gray-600">
                      {garage.openingHours.sunday.start} - {garage.openingHours.sunday.end}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {garage.paymentMethods.map((method, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {method}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{garage.phone}</p>
                    <p className="text-sm text-gray-600">Call now</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{garage.email}</p>
                    <p className="text-sm text-gray-600">Send email</p>
                  </div>
                </div>

                {garage.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <a 
                        href={garage.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                      <p className="text-sm text-gray-600">External link</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            {(garage.socialMedia.facebook || garage.socialMedia.twitter || garage.socialMedia.instagram) && (
              <Card>
                <CardHeader>
                  <CardTitle>Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {garage.socialMedia.facebook && (
                      <a 
                        href={garage.socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {garage.socialMedia.twitter && (
                      <a 
                        href={garage.socialMedia.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {garage.socialMedia.instagram && (
                      <a 
                        href={garage.socialMedia.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
