"use client"

import { useState } from "react"
import { VehicleValuation } from "@/components/add-listing/VehicleValuation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Car } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ValuationPage() {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [mileage, setMileage] = useState("")
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

  const handlePriceEstimate = (price: number) => {
    setEstimatedPrice(price)
  }

  const handleReset = () => {
    setRegistrationNumber("")
    setMileage("")
    setEstimatedPrice(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Car className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Vehicle Valuation
            </h1>
            <p className="text-lg text-gray-600">
              Get an instant estimate of your vehicle's trade retail value
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Vehicle Details</CardTitle>
              <CardDescription>
                Enter your vehicle's registration number and current mileage to get a free valuation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Number Input */}
              <div className="space-y-2">
                <Label htmlFor="registration" className="text-sm font-medium">
                  Registration Number
                </Label>
                <Input
                  id="registration"
                  type="text"
                  placeholder="e.g., AB12 CDE"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">
                  Enter your UK vehicle registration number
                </p>
              </div>

              {/* Mileage Input */}
              <div className="space-y-2">
                <Label htmlFor="mileage" className="text-sm font-medium">
                  Current Mileage
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="e.g., 50000"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">
                  Enter the current mileage in miles
                </p>
              </div>

              {/* Divider */}
              <div className="border-t pt-6">
                {/* Vehicle Valuation Component */}
                <VehicleValuation
                  registrationNumber={registrationNumber}
                  mileage={mileage}
                  onPriceEstimate={handlePriceEstimate}
                />
              </div>

              {/* Reset Button */}
              {(registrationNumber || mileage || estimatedPrice) && (
                <div className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    className="w-full"
                  >
                    Start New Valuation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Why Get a Valuation?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Know your car's current market value</li>
                  <li>• Make informed selling decisions</li>
                  <li>• Compare offers from dealers</li>
                  <li>• Set competitive pricing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>1. Enter your registration number</li>
                  <li>2. Add current mileage</li>
                  <li>3. Get instant valuation</li>
                  <li>4. Use the estimate for your listing</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          {estimatedPrice !== null && (
            <div className="mt-8 text-center">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardContent className="py-8">
                  <h3 className="text-2xl font-bold mb-3">Ready to Sell Your Vehicle?</h3>
                  <p className="text-blue-100 mb-6">
                    List your vehicle now and reach thousands of potential buyers
                  </p>
                  <Link href="/sell">
                    <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                      Create Your Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
