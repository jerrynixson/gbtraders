import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { VehicleCard } from "@/components/vehicle-card";

// Mock data for demonstration
const dealer = {
  name: "Best Cars Ltd",
  address: "1 Dealer Street, City 1, United Kingdom",
  phone: "+44 123 456 7890",
  image: "/dealers/dealer1.jpg",
  price: "",
  description:
    "Best Cars Ltd has been serving the community for over 20 years, offering a wide range of used cars, financing options, and extended warranties. Our experienced staff are dedicated to helping you find the perfect vehicle.",
  specialties: ["Used Cars", "Financing", "Warranty"],
  rating: 4.7,
  openingHours: "Mon-Fri: 9am-6pm",
};

const relatedDealers = [
  {
    id: "dealer-2",
    name: "Auto World",
    location: "City 2",
    image: "/dealers/dealer2.jpg",
    rating: 4.5,
    specialties: ["Used Cars", "Trade-In"],
    address: "2 Dealer Street, City 2, United Kingdom",
    phone: "0123 222 222",
    openingHours: "Mon-Fri: 9am-6pm",
  },
  {
    id: "dealer-3",
    name: "DriveTime Motors",
    location: "City 3",
    image: "/dealers/dealer3.jpg",
    rating: 4.6,
    specialties: ["Financing", "Warranty"],
    address: "3 Dealer Street, City 3, United Kingdom",
    phone: "0123 333 333",
    openingHours: "Mon-Fri: 9am-6pm",
  },
  {
    id: "dealer-4",
    name: "Premier Autos",
    location: "City 4",
    image: "/dealers/dealer4.jpg",
    rating: 4.8,
    specialties: ["Used Cars", "Financing"],
    address: "4 Dealer Street, City 4, United Kingdom",
    phone: "0123 444 444",
    openingHours: "Mon-Fri: 9am-6pm",
  },
];

// Mock data for dealer's vehicles
const dealerVehicles = [
  {
    id: 1,
    title: "BMW 3 Series 320d M Sport",
    price: 299,
    monthlyPrice: 299,
    image: "/cars/car1.jpg",
    distance: "0 miles away",
    location: "Best Cars Ltd",
    year: "2023",
    mileage: "0",
    fuel: "Diesel",
    transmission: "Automatic",
  },
  {
    id: 2,
    title: "Mercedes-Benz C-Class C220d AMG Line",
    price: 349,
    monthlyPrice: 349,
    image: "/cars/car2.jpg",
    distance: "0 miles away",
    location: "Best Cars Ltd",
    year: "2023",
    mileage: "0",
    fuel: "Diesel",
    transmission: "Automatic",
  },
  {
    id: 3,
    title: "Audi A4 40 TDI S line",
    price: 329,
    monthlyPrice: 329,
    image: "/cars/car3.jpg",
    distance: "0 miles away",
    location: "Best Cars Ltd",
    year: "2023",
    mileage: "0",
    fuel: "Diesel",
    transmission: "Automatic",
  },
  {
    id: 4,
    title: "Volkswagen Golf 2.0 TDI R-Line",
    price: 279,
    monthlyPrice: 279,
    image: "/cars/car4.jpg",
    distance: "0 miles away",
    location: "Best Cars Ltd",
    year: "2023",
    mileage: "0",
    fuel: "Diesel",
    transmission: "Automatic",
  },
];

export default function DealerInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Main Info */}
        <div className="flex-1 bg-white/70 rounded-3xl shadow-xl p-8">
          <div className="w-full h-72 relative mb-6">
            <Image
              src={dealer.image}
              alt={dealer.name}
              fill
              className="object-contain bg-white rounded-2xl"
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{dealer.name}</h1>
          <div className="flex items-center text-blue-700 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            {dealer.address}
          </div>
          <div className="flex items-center mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`h-5 w-5 inline-block ${i < Math.round(dealer.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
            ))}
            <span className="ml-2 text-blue-900 font-semibold">{dealer.rating}/5</span>
          </div>
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
          <p className="text-gray-700 mb-6">{dealer.description}</p>
        </div>
        {/* Right: Contact & Map */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-white/80 rounded-3xl shadow-lg p-6 flex flex-col items-center">
            <Button className="w-full mb-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold">
              <Phone className="mr-2" /> Call {dealer.phone}
            </Button>
            <Button variant="outline" className="w-full mb-3">
              Reply to Listing
            </Button>
            {dealer.price && <div className="text-2xl font-bold text-blue-900 mb-2">{dealer.price}</div>}
          </div>
          <div className="bg-white/80 rounded-3xl shadow-lg p-4">
            {/* Replace with real map if available */}
            <div className="w-full h-48 bg-gray-200 rounded-2xl flex items-center justify-center text-blue-400">
              Map Placeholder
            </div>
          </div>
        </div>
      </div>

      {/* More from this Dealer */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">More from {dealer.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dealerVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              id={vehicle.id}
              image={vehicle.image}
              title={vehicle.title}
              price={vehicle.price}
              monthlyPrice={vehicle.monthlyPrice}
              year={vehicle.year}
              mileage={vehicle.mileage}
              fuel={vehicle.fuel}
              transmission={vehicle.transmission}
              distance={vehicle.distance}
              location={vehicle.location}
              view="grid"
            />
          ))}
        </div>
      </div>

      {/* Related Dealers */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Discover More Trusted Dealers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedDealers.map((dealer) => (
            <div key={dealer.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 relative">
                <Image src={dealer.image} alt={dealer.name} fill className="object-contain bg-white rounded-t-xl" style={{ objectFit: "contain" }} />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{dealer.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {dealer.location}
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className={`h-4 w-4 inline-block ${j < Math.round(dealer.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                  ))}
                  <span className="ml-2 text-gray-700 font-medium">{dealer.rating}/5</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {dealer.specialties.map((spec, k) => (
                    <span key={k} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{spec}</span>
                  ))}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Address:</span> {dealer.address}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Phone:</span> {dealer.phone}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Hours:</span> {dealer.openingHours}
                </div>
                <div className="flex justify-end mt-auto">
                  <Link href={`/dealers/${dealer.id}`}>
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