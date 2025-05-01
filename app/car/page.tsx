"use client"

import { Header } from "@/components/header"
import { CarImageSection } from "@/components/car/car-image-section"
import { VehicleDetails } from "@/components/car/vehicle-summary"
import { HowLeasingWorks } from "@/components/car/how-leasing-works"
import { Reviews } from "@/components/car/reviews"
import { DealerInformation } from "@/components/car/dealer-information"
import { MoreFromDealer } from "@/components/car/more-from-dealer"
import { CarDetailsPayment } from "@/components/car/car-details-payment"
import { Footer } from "@/components/footer"
import { ScrollText, FileSearch } from "lucide-react"
import { Heart, ChevronRight, Flag } from "lucide-react"
import { FeaturesDropdown } from "@/components/car/features-dropdown"

export default function Home() {
  // Vehicle specifications
  const vehicleData = {
    specifications: {
      fuelType: "Petrol",
      bodyType: "SUV",
      gearbox: "Automatic",
      doors: 5,
      seats: 5,
      mileage: 35000,
      engineSize: "2.0",
    },
    runningCosts: {
      mpg: 40,
      costToFill: 70,
      range: 400,
      ulezCompliant: true,
      insuranceGroup: 20,
      vehicleTax: 150,
    },
  };

  // Review data
  const reviewData = {
    carName: "Vauxhall Grandland",
    rating: 4.0,
    reviewText: `"Not too obvious, or flashy in the regular range, we nothing unusual and quietly achieve in easy lights form or restrained bumper flares. This one for the Vauxhall Grandland is a much more dynamic, though, and transforms an also-ran into a genuine contender. Search Autotrader...

...and get the other trim-spec SUVs and crossovers it meets all the help it can get, too, the simpler range structure and option of a competitively priced and effective..."`,
  }

  // Dealer information
  const dealerInfo = {
    name: "Bristol Street Motors",
    location: "Ford Bromley",
    rating: 4.7,
    phoneNumber: "0203 0333 0938",
    description: "A trusted automotive dealership with over 25 years of experience in providing high-quality vehicles and exceptional customer service. Our team is dedicated to helping you find the perfect car that meets your needs and budget. We pride ourselves on transparency, reliability, and a customer-first approach."
  }

  // More from dealer cars
  const dealerCars = [
    {
      price: "£123",
      term: "Monthly, 48 month lease",
      name: "Vauxhall Grandland",
      description: "1.2 Turbo SE 5dr",
      fullPrice: "£250.00",
      year: "2023",
      fuelType: "Petrol",
      transmission: "Automatic",
    },
    {
      price: "£234",
      term: "Monthly, 48 month lease",
      name: "CUPRA Born",
      description: "150kW V2 58kWh 5dr Auto",
      fullPrice: "£234.00",
      year: "2023",
      fuelType: "Electric",
      transmission: "Automatic",
    },
    {
      price: "£345",
      term: "Monthly, 48 month lease",
      name: "Nissan Qashqai",
      description: "1.3 DiG-T MH Acenta Premium 5dr",
      fullPrice: "£345.00",
      year: "2023",
      fuelType: "Hybrid",
      transmission: "Manual",
    },
    {
      price: "£456",
      term: "Monthly, 48 month lease",
      name: "Skoda Kamiq",
      description: "1.0 TSI SE 5dr DSG",
      fullPrice: "£456.00",
      year: "2023",
      fuelType: "Petrol",
      transmission: "Automatic",
    },
  ]

  // Car details for payment section
  const carDetails = {
    carName: "Vauxhall Grandland",
    carDescription: "1.2 Turbo SE 5dr [Start Stop] [Euro 6d]",
    price: "£250.47",
    initialPayment: "£750.00",
    monthlyPayments: 3,
    dealerName: "Bristol Street Motors",
    dealerLocation: "Ford Bromley",
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7">
            <CarImageSection />
            <VehicleDetails specifications={vehicleData.specifications} 
            runningCosts={vehicleData.runningCosts} 
            />

            {/* Car Description Box */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 mb-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">About This Vehicle</h3>
              <p className="text-gray-600 leading-relaxed">
                The Vauxhall Grandland is a versatile and stylish SUV that combines comfort, practicality, and modern design. Featuring a spacious interior, advanced technology, and efficient performance, this vehicle is perfect for both urban commuting and weekend adventures. With its sleek exterior, comfortable ride, and range of modern features, the Grandland offers an exceptional driving experience for families and professionals alike.
              </p>
              {/* Vehicle History Button */}
              <div className="mt-4">
                <button className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white py-3 px-6 rounded-lg font-medium shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group">
                  <FileSearch className="h-5 w-5 transition-transform group-hover:rotate-6" />
                  <span>Check Vehicle History</span>
                </button>
              </div>
            </div>

            {/* Features Dropdown */}
            <div className="mt-4 mb-6">
              <FeaturesDropdown 
                specifications={vehicleData.specifications}
                runningCosts={vehicleData.runningCosts}
              />
            </div>

            <HowLeasingWorks />
            <Reviews {...reviewData} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            {/* Add to Favorites and Report Listing Buttons */}
            <div className="flex justify-between items-center mb-4">
              {/* Favorites Button */}
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Heart className="h-4 w-4" />
                <span>Save</span>
              </button>

              {/* Report Listing Button */}
              <button className="inline-flex items-center justify-center rounded-md bg-muted p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Flag className="h-4 w-4" />
              </button>
            </div>
            <CarDetailsPayment {...carDetails} />
            <DealerInformation {...dealerInfo} />
            <MoreFromDealer cars={dealerCars} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}