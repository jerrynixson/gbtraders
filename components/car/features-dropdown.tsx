"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface FeaturesDropdownProps {
  specifications: {
    fuelType: string
    bodyType: string
    gearbox: string
    doors: number
    seats: number
    mileage: number
    engineSize: string
  }
  runningCosts: {
    mpg: number
    costToFill: number
    range: number
    ulezCompliant: boolean
    insuranceGroup: number
    vehicleTax: number
  }
}

export function FeaturesDropdown({ specifications, runningCosts }: FeaturesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
      >
        <span>View All Features and Specs</span>
        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Specifications Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Fuel Type</div>
                  <div className="font-medium">{specifications.fuelType}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Body Type</div>
                  <div className="font-medium">{specifications.bodyType}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Gearbox</div>
                  <div className="font-medium">{specifications.gearbox}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Doors</div>
                  <div className="font-medium">{specifications.doors}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Seats</div>
                  <div className="font-medium">{specifications.seats}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Mileage</div>
                  <div className="font-medium">{specifications.mileage.toLocaleString()} miles</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Engine Size</div>
                  <div className="font-medium">{specifications.engineSize}L</div>
                </div>
              </div>
            </div>

            {/* Running Costs Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Running Costs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">MPG</div>
                  <div className="font-medium">{runningCosts.mpg} mpg</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Cost to Fill</div>
                  <div className="font-medium">£{runningCosts.costToFill}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Range</div>
                  <div className="font-medium">{runningCosts.range} miles</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">ULEZ Compliant</div>
                  <div className="font-medium">{runningCosts.ulezCompliant ? "Yes" : "No"}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Insurance Group</div>
                  <div className="font-medium">{runningCosts.insuranceGroup}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Vehicle Tax</div>
                  <div className="font-medium">£{runningCosts.vehicleTax}/year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 