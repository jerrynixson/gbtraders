"use client"

import { useState } from "react"
import { FilterSidebar } from "@/components/search/filter-sidebar"
import { SearchHeader } from "@/components/search/search-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Car, 
  Heart, 
  Share2, 
  Phone, 
  Mail, 
  MessageSquare, 
  Tag, 
  Shield, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List,
  Search
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Mock vehicle data
const vehicles = [
  {
    id: 1,
    title: "2023 Audi Q5 S Line 40 TDI Quattro",
    price: 42999,
    monthlyPrice: 599,
    mainImage: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=640&q=80",
    distance: "3.2 miles away",
    location: "London Dealership",
    year: 2023,
    mileage: 5420,
    fuel: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    engine: "2.0L",
    color: "Glacier White",
    dealerRating: 4.8,
    dealerReviews: 127,
    features: ["Leather Interior", "Satellite Navigation", "Heated Seats", "360° Camera", "Virtual Cockpit"],
    isSponsored: true,
    isHighlighted: false,
  },
  {
    id: 2,
    title: "2024 BMW X3 xDrive20d M Sport",
    price: 48795,
    monthlyPrice: 699,
    mainImage: "https://www.topgear.com/sites/default/files/images/cars-road-test/carousel/2017/11/387275614baf16e63e8520f1172cd1c8/_smc4908.jpg?w=1952&h=1098",
    distance: "5.7 miles away",
    location: "Premier BMW",
    year: 2024,
    mileage: 1250,
    fuel: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    engine: "2.0L",
    color: "Carbon Black",
    dealerRating: 4.7,
    dealerReviews: 89,
    features: ["Panoramic Roof", "Apple CarPlay", "LED Headlights", "Heated Steering Wheel", "19\" Alloys"],
    isSponsored: false,
    isHighlighted: true,
  },
  {
    id: 3,
    title: "2022 Mercedes-Benz E300 AMG Line Premium Plus",
    price: 39995,
    monthlyPrice: 525,
    mainImage: "https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/QZAAAOSwb0xiefG8/$_86.JPG",
    distance: "8.1 miles away",
    location: "Auto Excellence",
    year: 2022,
    mileage: 12850,
    fuel: "Petrol Hybrid",
    transmission: "Automatic",
    bodyType: "Saloon",
    engine: "2.0L",
    color: "Obsidian Black",
    dealerRating: 4.5,
    dealerReviews: 203,
    features: ["Burmester Sound System", "Adaptive Cruise Control", "Memory Seats", "Wireless Charging", "Digital Dashboard"],
    isSponsored: false,
    isHighlighted: false,
  },
  {
    id: 4,
    title: "2025 Tesla Model Y Long Range",
    price: 51990,
    monthlyPrice: 649,
    mainImage: "https://s.yimg.com/zb/imgv1/2ecef3ba-6227-3f32-b844-02e2bf46a057/t_500x300",
    distance: "12.4 miles away",
    location: "EV Direct",
    year: 2025,
    mileage: 320,
    fuel: "Electric",
    transmission: "Automatic",
    bodyType: "SUV",
    engine: "Dual Motor",
    color: "Pearl White",
    dealerRating: 4.9,
    dealerReviews: 76,
    features: ["Autopilot", "Full Self Driving", "Glass Roof", "Premium Interior", "19\" Gemini Wheels"],
    isSponsored: true,
    isHighlighted: true,
  },
  {
    id: 5,
    title: "2023 Range Rover Sport HSE Dynamic",
    price: 76500,
    monthlyPrice: 899,
    mainImage: "https://i.ytimg.com/vi/YacZjYdoa4M/maxresdefault.jpg",
    distance: "6.8 miles away",
    location: "Prestige Motors",
    year: 2023,
    mileage: 9620,
    fuel: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    engine: "3.0L",
    color: "Santorini Black",
    dealerRating: 4.6,
    dealerReviews: 152,
    features: ["Head-up Display", "Meridian Sound System", "Soft Close Doors", "Air Suspension", "Pixel LED Headlights"],
    isSponsored: false,
    isHighlighted: false,
  },
  {
    id: 6,
    title: "2024 Porsche Taycan 4S",
    price: 89995,
    monthlyPrice: 1250,
    mainImage: "https://vehicle-images.dealerinspire.com/7dfb-110006168/WP0AB2Y16RSA35024/a9bc7955c8aec37f44d34ad8bc066017.jpg",
    distance: "15.2 miles away",
    location: "Luxury Auto Center",
    year: 2024,
    mileage: 2480,
    fuel: "Electric",
    transmission: "Automatic",
    bodyType: "Saloon",
    engine: "Dual Motor",
    color: "Frozen Blue Metallic",
    dealerRating: 4.9,
    dealerReviews: 84,
    features: ["Performance Battery Plus", "BOSE Surround Sound", "Sport Chrono Package", "18-way Adaptive Sports Seats", "Porsche Dynamic Light System Plus"],
    isSponsored: false,
    isHighlighted: true,
  },
  {
    id: 7,
    title: "2021 Volvo XC60 R-Design Pro",
    price: 37950,
    monthlyPrice: 499,
    mainImage: "https://media.autoexpress.co.uk/image/private/s--X-WVjvBW--/f_auto,t_content-image-full-desktop@1/v1633016243/autoexpress/2021/09/Volvo-XC60-2021-facelift-front-tracking.jpg",
    distance: "9.5 miles away",
    location: "Volvo City",
    year: 2021,
    mileage: 15800,
    fuel: "Diesel",
    transmission: "Automatic",
    bodyType: "SUV",
    engine: "2.0L",
    color: "Crystal White",
    dealerRating: 4.6,
    dealerReviews: 110,
    features: ["Pilot Assist", "Harman Kardon Sound", "Heated Seats", "Panoramic Roof", "Adaptive Cruise"],
    isSponsored: false,
    isHighlighted: false,
  },
  {
    id: 8,
    title: "2020 Honda Civic Sport Line",
    price: 21495,
    monthlyPrice: 299,
    mainImage: "https://tse2.mm.bing.net/th?id=OIP.DQxvZwWTRupvN0Vu0S4eXgHaEK&pid=Api&P=0&h=180",
    distance: "2.3 miles away",
    location: "Honda Direct",
    year: 2020,
    mileage: 9800,
    fuel: "Petrol",
    transmission: "Manual",
    bodyType: "Hatchback",
    engine: "1.0L",
    color: "Rallye Red",
    dealerRating: 4.4,
    dealerReviews: 95,
    features: ["Apple CarPlay", "Rear Camera", "Sport Styling", "LED Headlights", "Climate Control"],
    isSponsored: false,
    isHighlighted: false,
  },
  {
    id: 9,
    title: "2022 Kia Sportage GT-Line",
    price: 28995,
    monthlyPrice: 399,
    mainImage: "https://tse4.mm.bing.net/th?id=OIP.qEtjTfasc6kUkTemPYOJ2wAAAA&pid=Api&P=0&h=180",
    distance: "7.8 miles away",
    location: "Kia Motors",
    year: 2022,
    mileage: 6700,
    fuel: "Hybrid",
    transmission: "Automatic",
    bodyType: "SUV",
    engine: "1.6L",
    color: "Lunar Silver",
    dealerRating: 4.7,
    dealerReviews: 120,
    features: ["Wireless Charging", "Smart Cruise", "Heated Seats", "Parking Sensors", "19\" Alloys"],
    isSponsored: false,
    isHighlighted: false,
  },
];

// Vehicle card component
type VehicleCardProps = {
  vehicle: typeof vehicles[0]
  view: "grid" | "list"
}

function VehicleCard({ vehicle, view }: VehicleCardProps) {
  const isGrid = view === "grid";
  
  return (
    <div className={`group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100 ${isGrid ? 'flex flex-col h-full' : 'flex'} ${vehicle.isHighlighted ? 'ring-2 ring-blue-100' : ''}`}>
      {/* Highlighted styling */}
      <div className={`relative ${isGrid ? 'w-full' : 'w-1/3'}`}>
        <div className="relative overflow-hidden">
          <img 
            src={vehicle.mainImage} 
            alt={vehicle.title}
            className={`object-cover w-full ${isGrid ? 'h-48' : 'h-full'} transition-transform duration-500 group-hover:scale-105`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-white text-sm font-medium">View Details</div>
          </div>
        </div>
        {vehicle.isHighlighted && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white text-xs py-1 px-2 rounded-full font-medium z-10 shadow-sm">
            Featured
          </div>
        )}
        <button className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all duration-200 hover:scale-110 z-10">
          <Heart className="h-4 w-4 text-gray-700" />
        </button>
      </div>
      
      <div className={`p-4 flex flex-col flex-1 ${isGrid ? '' : 'justify-between'}`}>
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-blue-800 transition-colors duration-200 line-clamp-2">{vehicle.title}</h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {vehicle.distance}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{vehicle.location}</span>
                </div>
              </div>
            </div>
            <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:scale-110 flex-shrink-0">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Year:</span> 
              <span className="text-gray-600">{vehicle.year}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Mileage:</span> 
              <span className="text-gray-600">{vehicle.mileage.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Fuel:</span> 
              <span className="text-gray-600">{vehicle.fuel}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Trans:</span> 
              <span className="text-gray-600">{vehicle.transmission}</span>
            </div>
          </div>
        </div>
        
        <div className={`${isGrid ? 'mt-auto' : 'flex items-center justify-between gap-4 mt-4'}`}>
          <div className={`${isGrid ? '' : 'flex-1'}`}>
            <div className="text-xl font-bold text-blue-800">£{vehicle.price.toLocaleString()}</div>
            <div className="text-xs text-gray-600">£{vehicle.monthlyPrice}/month</div>
          </div>
          
          <Button 
            className={`${isGrid ? 'w-full mt-6' : 'w-40 ml-4 mt-6'} bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 h-10 shadow-md rounded-lg font-semibold`}
          >
            <span>View Details</span>
            <ChevronRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VehicleShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("distance")
  const [currentPage, setCurrentPage] = useState(1)
  const totalResults = 1245
  const totalPages = Math.ceil(totalResults / 10)
  
  const handleSortChange = (value: string) => {
    setSortBy(value)
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 mb-6 lg:mb-0">
              <div className="sticky top-6">
                <FilterSidebar />
              </div>
            </aside>
            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* View and Sort controls */}
              <div className="sticky top-4 z-20 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* View toggle left */}
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
                {/* Centered search bar */}
                <div className="flex-1 flex justify-center">
                  <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      className="w-full pl-12 pr-4 py-2 rounded-full border border-gray-200 focus:ring-blue-500 focus:border-blue-500 text-base bg-white placeholder-gray-400 shadow-sm transition-all duration-200"
                    />
                    <Search className="absolute left-4 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {/* Sort and results right */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-3">Sort by:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px]"
                    >
                      <option value="distance">Distance</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-600 whitespace-nowrap">
                    {totalResults.toLocaleString()} vehicles found
                  </div>
                </div>
              </div>
              {/* Vehicle listings */}
              <section className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-8"} transition-all`}> 
                {vehicles.map(vehicle => (
                  <VehicleCard 
                    key={vehicle.id} 
                    vehicle={vehicle} 
                    view={viewMode} 
                  />
                ))}
              </section>
              {/* Trust badges */}
              <section className="bg-white p-8 my-10 border border-gray-200 rounded-2xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-100 group-hover:to-blue-200">
                      <Shield className="h-9 w-9 text-blue-800" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-800 transition-colors duration-200">Buyer Protection</h3>
                    <p className="text-sm text-gray-600 mt-2">All vehicles history checked</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-100 group-hover:to-blue-200">
                      <Car className="h-9 w-9 text-blue-800" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-800 transition-colors duration-200">Quality Assured</h3>
                    <p className="text-sm text-gray-600 mt-2">Inspected by certified technicians</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-full mb-4 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-100 group-hover:to-blue-200">
                      <CheckCircle className="h-9 w-9 text-blue-800" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-800 transition-colors duration-200">Satisfaction Guaranteed</h3>
                    <p className="text-sm text-gray-600 mt-2">14-day money back guarantee</p>
                  </div>
                </div>
              </section>
              {/* Pagination */}
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}