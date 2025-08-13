import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Clock, Globe, Mail, CreditCard, Share2, Facebook, Twitter, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { GoogleMapComponent } from "@/components/ui/google-map"

// Mock data for demonstration
// Using a single cover image and a single main image (logo/photo) similar to dealers page
const garage = {
  id: "amg-motors",
  name: "AMG Mechanical engineering",
  address: "B12 0DF, Birmingham, West Midlands, England, United Kingdom",
  phone: "+44 121 446 5777",
  // Main (logo/profile) image
  image: "/garages/logo-amg.jpg",
  // Cover/banner image
  coverImage: "/garages/garage1.jpg",
  price: "£0.00",
  description:
    "The mechanics at our shop have over 60 years of experience between them. They are dedicated to providing high-quality repairs to keep you safe and happy.",
  services: [
    "Electric issue repair",
    "Programming",
    "Commercial vehicle repair",
    "Sunroof repair",
    "Suspension repair",
    "Vehicle diagnostics",
    "Manual Gearbox repair",
    "Automatic Gearbox repair",
    "DPF Cleaning",
    "Starter motor/Alternator Repair",
    "Battery servicing",
    "Air conditioning",
    "Brakes and Clutches",
    "Electric car/van Repair",
    "Hybrid car repair",
    "LPG Repair",
    "Range Rover Specialist",
    "Wheel Alignment",
    "Tyre Change",
    "Car Accessories and Parts",
    "Garage Equipment",
    "Body Repair",
    "MOT",
    "Welding",
    "Turbochargers Repair",
    "Motorcycle repairs & services"
  ],
  rating: 4.8,
  openingHours: {
    weekdays: { start: "08:00", end: "18:00" },
    saturday: { start: "09:00", end: "17:00" },
    sunday: { start: "10:00", end: "16:00" }
  },
  website: "www.amgmotors.com",
  email: "info@amgmotors.com",
  paymentMethods: ["Cash", "Credit Card", "Debit Card", "PayPal"],
  socialMedia: {
    facebook: "https://facebook.com/AMGMotors",
    twitter: "https://twitter.com/AMGMotors",
    instagram: "https://instagram.com/AMGMotors"
  }
};

// Mock related garages data
const relatedGarages = [
  {
    id: "s-motors",
    name: "S Motors",
    location: "London",
    image: "/garages/garage2.jpg",
    rating: 4.6,
    services: ["Commercial Vehicles", "Electrical Repairs"],
    address: "45 East London Way, London E14 9PP",
    phone: "020 7890 1234",
    openingHours: {
      weekdays: { start: "07:30", end: "18:30" },
      saturday: { start: "09:00", end: "17:00" },
      sunday: { start: "10:00", end: "16:00" }
    }
  },
  {
    id: "city-auto-services",
    name: "City Auto Services",
    location: "Manchester",
    image: "/garages/garage3.jpg",
    rating: 4.7,
    services: ["General Repairs", "Tire Service"],
    address: "78 Manchester Road, Manchester M1 2AB",
    phone: "0161 456 7890",
    openingHours: {
      weekdays: { start: "08:00", end: "17:30" },
      saturday: { start: "09:00", end: "17:00" },
      sunday: { start: "10:00", end: "16:00" }
    }
  },
  {
    id: "elite-motors",
    name: "Elite Motors",
    location: "Leeds",
    image: "/garages/garage4.jpg",
    rating: 4.9,
    services: ["Luxury Cars", "Performance Tuning"],
    address: "15 Leeds Business Park, Leeds LS1 2AB",
    phone: "0113 789 0123",
    openingHours: {
      weekdays: { start: "08:30", end: "18:00" },
      saturday: { start: "09:00", end: "17:00" },
      sunday: { start: "10:00", end: "16:00" }
    }
  }
];

export default function GarageInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Main Info (2/3 width) */}
        <div className="flex-1 bg-white/70 rounded-3xl shadow-xl p-8">
          {/* Cover Image with overlaid main image (logo/photo) */}
          <div className="w-full h-72 relative mb-6">
            <Image
              src={garage.coverImage || garage.image}
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
          <div className="flex gap-4 mb-6">
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
              <Mail className="mr-2" /> Message
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
              <Globe className="mr-2" /> Website
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
              <Phone className="mr-2" /> Call
            </Button>
          </div>

          {/* Garage Info */}
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{garage.name}</h1>
          <div className="flex items-center text-blue-700 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            {garage.address}
          </div>
          <div className="flex items-center mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(garage.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
              />
            ))}
            <span className="ml-2 text-blue-900 font-semibold">{garage.rating}/5</span>
          </div>

          {/* Business Overview */}
          <div className="mb-6">
            <h2 className="font-semibold text-blue-800 mb-3">Business Overview</h2>
            <p className="text-gray-700">{garage.description}</p>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h2 className="font-semibold text-blue-800 mb-3">Products & Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {garage.services.map((service, i) => (
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

          {/* Rating Summary */}
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <h2 className="font-semibold text-blue-800 mb-3">Rating Summary</h2>
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(garage.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                />
              ))}
              <span className="ml-2 text-blue-900 font-semibold">{garage.rating}/5</span>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <h2 className="font-semibold text-blue-800 mb-3">Opening Hours</h2>
            <div className="space-y-2">
              <p className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>Monday - Friday: {garage.openingHours.weekdays.start} - {garage.openingHours.weekdays.end}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>Saturday: {garage.openingHours.saturday.start} - {garage.openingHours.saturday.end}</span>
              </p>
              <p className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <span>Sunday: {garage.openingHours.sunday.start} - {garage.openingHours.sunday.end}</span>
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white/80 rounded-3xl shadow-lg p-6">
            <h2 className="font-semibold text-blue-800 mb-3">Payment Methods</h2>
            <div className="flex flex-wrap gap-2">
              {garage.paymentMethods.map((method, i) => (
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
              {garage.socialMedia.facebook && (
                <a href={garage.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {garage.socialMedia.twitter && (
                <a href={garage.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {garage.socialMedia.instagram && (
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
          {relatedGarages.map((garage) => (
            <div key={garage.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 relative">
                <Image src={garage.image} alt={garage.name} fill className="object-cover rounded-t-xl" style={{ objectFit: "cover" }} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{garage.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {garage.location}
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < Math.round(garage.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                  <span className="ml-2 text-gray-700 font-medium">{garage.rating}/5</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {garage.services.slice(0, 3).map((service, k) => (
                    <span key={k} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{service}</span>
                  ))}
                  {garage.services.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                      +{garage.services.length - 3} more
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Address:</span> {garage.address}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Phone:</span> {garage.phone}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Hours:</span> Mon-Fri: {garage.openingHours.weekdays.start}-{garage.openingHours.weekdays.end}
                </div>
                <div className="flex justify-end mt-auto">
                  <Link href={`/categories/garages/${garage.id}`}>
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