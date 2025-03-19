"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Car, PoundSterling, Clock, Gauge, Tag, Shield, Star, ChevronRight, RotateCcw } from "lucide-react"

type ToggleButtonProps = {
  options: [string, string]
  activeIndex: number
  onChange: (index: number) => void
}

function ToggleButton({ options, activeIndex, onChange }: ToggleButtonProps) {
  return (
    <div className="flex rounded-full overflow-hidden border border-gray-300 w-full">
      {options.map((option, index) => (
        <button
          key={index}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeIndex === index ? "bg-green-800 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onChange(index)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

type ExpandableSectionProps = {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
}

function ExpandableSection({ title, children, icon }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="py-3">
      <button className="flex items-center justify-between w-full text-left" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <span className="font-medium">{title}</span>
        </div>
        <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
      </button>

      {isExpanded && <div className="mt-3 pl-6">{children}</div>}
    </div>
  )
}

type FilterItemProps = {
  label: string
  count?: number
  onClick?: () => void
}

function FilterItem({ label, count, onClick }: FilterItemProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      {count !== undefined && (
        <span className="text-xs bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          {count}
        </span>
      )}
      <ChevronRight className="h-4 w-4" />
    </div>
  )
}

export function FilterSidebar() {
  const [priceToggle, setPriceToggle] = useState(0) // 0 for Price, 1 for Monthly cost
  const [yearToggle, setYearToggle] = useState(0) // 0 for Year, 1 for Age
  const [keyword, setKeyword] = useState("")

  const commonFeatures = ["Wheelchair Access", "Left Hand Drive", "Sat Nav", "Bluetooth", "Leather Seats"]

  const handleReset = () => {
    // Reset all filters
    setPriceToggle(0)
    setYearToggle(0)
    setKeyword("")
    // Reset other state as needed
  }

  return (
    <div className="w-full max-w-xs border-r border-gray-200 bg-white">
      <div className="p-4">
        <Button
          variant="outline"
          className="flex items-center text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 w-full justify-center mb-4"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset All
        </Button>

        {/* Search Radius */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <MapPin className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Search Radius</h3>
          </div>
          <Input placeholder="CR26EW" className="w-full" />
        </div>

        {/* Make, Model & Trim */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <Car className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Make, Model & Trim</h3>
          </div>

          <FilterItem label="Make" count={1} />
          <FilterItem label="Model" />
          <FilterItem label="Trim" />
          <FilterItem label="Body Style" />
        </div>

        {/* Budget */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <PoundSterling className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Budget</h3>
          </div>

          <div className="mb-4">
            <ToggleButton options={["Price", "Monthly cost"]} activeIndex={priceToggle} onChange={setPriceToggle} />
          </div>

          <div className="space-y-3">
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>Min price (any)</option>
              <option>£1,000</option>
              <option>£2,000</option>
              <option>£5,000</option>
              <option>£10,000</option>
            </select>

            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>Max price (any)</option>
              <option>£5,000</option>
              <option>£10,000</option>
              <option>£20,000</option>
              <option>£50,000</option>
            </select>
          </div>
        </div>

        {/* Year Or Age */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <Clock className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Year Or Age</h3>
          </div>

          <div className="mb-4">
            <ToggleButton options={["Year", "Age"]} activeIndex={yearToggle} onChange={setYearToggle} />
          </div>

          <div className="space-y-3">
            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>2025 (Newest Year)</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
              <option>2021</option>
            </select>

            <select className="w-full border border-gray-300 rounded-md p-2">
              <option>1920 (Oldest Year)</option>
              <option>1950</option>
              <option>1980</option>
              <option>2000</option>
              <option>2010</option>
            </select>
          </div>
        </div>

        {/* Vehicle Attributes */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <Gauge className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Vehicle Attributes</h3>
          </div>

          <FilterItem label="Mileage" />
          <FilterItem label="Fuel Type & Range" />
          <FilterItem label="Transmission" />
          <FilterItem label="Number of Doors" />
          <FilterItem label="Number of Seats" />
          <FilterItem label="Colour" />
        </div>

        {/* Vehicle Features */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <Tag className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Vehicle Features</h3>
          </div>

          <div className="flex mb-4">
            <Input
              placeholder="Enter keywords here..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button className="bg-green-500 hover:bg-green-600">Add</Button>
          </div>

          <p className="text-xs text-gray-500 mb-2">You can also select Common Keywords to include in your search:</p>

          <div className="space-y-2">
            {commonFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Checkbox id={`feature-${index}`} className="mr-2" />
                <label htmlFor={`feature-${index}`} className="text-sm">
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & History */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <Shield className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Safety & History</h3>
          </div>

          <FilterItem label="Safety Ratings" />
          <FilterItem label="Vehicle History" />
          <FilterItem label="Vehicle Usage" />
        </div>

        {/* Advert Options */}
        <div className="border-t border-gray-200 py-4">
          <div className="flex items-center mb-3">
            <Star className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Advert Options</h3>
          </div>

          <FilterItem label="Dealer Rating" />
        </div>
      </div>
    </div>
  )
}

