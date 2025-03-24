import { Header } from "@/components/header"
import { QuickInfoBar } from "@/components/car/quick-info-bar"
import { CarImageSection } from "@/components/car/car-image-section"
import { VehicleDetails } from "@/components/car/vehicle-summary"
import { HowLeasingWorks } from "@/components/car/how-leasing-works"
import { Reviews } from "@/components/car/reviews"
import { DealerInformation } from "@/components/car/dealer-information"
import { MoreFromDealer } from "@/components/car/more-from-dealer"
import { CarDetailsPayment } from "@/components/car/car-details-payment"
import { Footer } from "@/components/footer"
import { Heart, ChevronRight } from "lucide-react"

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
      <QuickInfoBar />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7">
            <CarImageSection />
            <VehicleDetails specifications={vehicleData.specifications} 
            runningCosts={vehicleData.runningCosts} 
            />
            {/* View All Features Button */}
            <div className="mt-4 mb-6">
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium shadow-lg transform transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl">
                <span>View All Features and Specs</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <HowLeasingWorks />
            <Reviews {...reviewData} />
            
            <MoreFromDealer cars={dealerCars} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5">
            {/* Add to Favorites Button */}
            <div className="mb-4 flex justify-end">
              <button className="flex items-center gap-2 bg-white border-2 border-red-500 hover:bg-red-50 text-red-500 hover:text-red-600 py-2 px-4 rounded-full font-medium shadow-md transition-all duration-200 hover:shadow-lg">
                <Heart className="h-5 w-5" />
                <span>Add to Favorites</span>
              </button>
            </div>
            <CarDetailsPayment {...carDetails} />
            <DealerInformation {...dealerInfo} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

