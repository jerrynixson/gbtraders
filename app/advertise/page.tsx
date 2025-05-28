"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Car,
  Upload,
  Phone,
  Trash2,
  Calendar,
  Gauge,
  PaintBucket,
  Fuel,
  Banknote,
  Info,
  FileText,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

interface AdvertisementForm {
  category: string
  make: string
  model: string
  year: number
  price: number
  fuelType: string
  engineSize: number
  color: string
  description: string
  co2Emission: string
  call: string
  mileage: number
  transmission: string
  registrationMonth: string
  registrationNumber: string
  images: File[]
  location: {
    city: string
    country: string
    coordinates: {
      latitude: string
      longitude: string
    }
  }
}

export default function AdvertisePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [progress, setProgress] = useState<number>(25)
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [formData, setFormData] = useState<AdvertisementForm>({
    category: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: 0,
    fuelType: "",
    engineSize: 0,
    color: "",
    description: "",
    co2Emission: "",
    call: "",
    mileage: 0,
    transmission: "",
    registrationMonth: "",
    registrationNumber: "",
    images: [],
    location: {
      city: "",
      country: "",
      coordinates: {
        latitude: "",
        longitude: ""
      }
    }
  })

  // Don't render anything while checking authentication
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Sign in Required</CardTitle>
              <CardDescription>Please sign in to post your advertisement</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Link href={`/signin?redirectTo=${encodeURIComponent("/advertise")}`}>
                <Button size="lg" className="px-8">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: AdvertisementForm) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: AdvertisementForm) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: AdvertisementForm) => ({
      ...prev,
      [name]: Number.parseFloat(value) || 0,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)

      // Create preview URLs for the images
      const newImageUrls = files.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls((prev) => [...prev, ...newImageUrls])

      setFormData((prev: AdvertisementForm) => ({
        ...prev,
        images: [...prev.images, ...files],
      }))
    }
  }

  const removeImage = (index: number) => {
    // Remove from preview URLs
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))

    // Remove from form data
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => {
      const newStep = prev + 1
      setProgress(newStep * 25)
      return newStep
    })
  }

  const prevStep = () => {
    setCurrentStep((prev) => {
      const newStep = Math.max(1, prev - 1)
      setProgress(newStep * 25)
      return newStep
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement form submission logic
      toast({
        title: "Success!",
        description: "Your advertisement has been posted successfully.",
        variant: "default",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post advertisement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Step {currentStep} of 4</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const handleCoordinatesChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [field]: value
        }
      }
    }))
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base">
            <Car className="inline-block w-4 h-4 mr-2" />
            Vehicle Category
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="van">Van</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="electric-vehicle">Electric Vehicle</SelectItem>
              <SelectItem value="caravan">Caravan</SelectItem>
              <SelectItem value="e-bike">E-Bike</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="make" className="text-base">
            Make
          </Label>
          <Input
            id="make"
            name="make"
            type="text"
            required
            value={formData.make}
            onChange={handleInputChange}
            placeholder="e.g., Toyota"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model" className="text-base">
            Model
          </Label>
          <Input
            id="model"
            name="model"
            type="text"
            required
            value={formData.model}
            onChange={handleInputChange}
            placeholder="e.g., Corolla"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="year" className="text-base">
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Year
          </Label>
          <Input
            id="year"
            name="year"
            type="number"
            required
            value={formData.year}
            onChange={handleNumberChange}
            placeholder="e.g., 2023"
            className="h-10"
          />
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={nextStep} className="w-full">
          Next: Vehicle Details
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-base">
            <Banknote className="inline-block w-4 h-4 mr-2" />
            Price
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
            <Input
              id="price"
              name="price"
              type="number"
              required
              value={formData.price}
              onChange={handleNumberChange}
              placeholder="e.g., 25000"
              className="h-10 pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelType" className="text-base">
            <Fuel className="inline-block w-4 h-4 mr-2" />
            Fuel Type
          </Label>
          <Select value={formData.fuelType} onValueChange={(value) => handleSelectChange("fuelType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="plug-in-hybrid">Plug-in Hybrid</SelectItem>
              <SelectItem value="lpg">LPG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="engineSize" className="text-base">
            <Gauge className="inline-block w-4 h-4 mr-2" />
            Engine Size (L)
          </Label>
          <Input
            id="engineSize"
            name="engineSize"
            type="number"
            step="0.1"
            required
            value={formData.engineSize}
            onChange={handleNumberChange}
            placeholder="e.g., 1.6"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color" className="text-base">
            <PaintBucket className="inline-block w-4 h-4 mr-2" />
            Color
          </Label>
          <Input
            id="color"
            name="color"
            type="text"
            required
            value={formData.color}
            onChange={handleInputChange}
            placeholder="e.g., Silver"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transmission" className="text-base">
            Transmission
          </Label>
          <Select value={formData.transmission} onValueChange={(value) => handleSelectChange("transmission", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select transmission type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mileage" className="text-base">
            Mileage
          </Label>
          <Input
            id="mileage"
            name="mileage"
            type="number"
            required
            value={formData.mileage}
            onChange={handleNumberChange}
            placeholder="e.g., 15000"
            className="h-10"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={prevStep} variant="outline" className="w-1/2">
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2">
          Next: Registration Details
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="registrationMonth" className="text-base">
            Registration Month
          </Label>
          <Input
            id="registrationMonth"
            name="registrationMonth"
            type="text"
            required
            value={formData.registrationMonth}
            onChange={handleInputChange}
            placeholder="e.g., March 2023"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber" className="text-base">
            Registration Number
          </Label>
          <Input
            id="registrationNumber"
            name="registrationNumber"
            type="text"
            required
            value={formData.registrationNumber}
            onChange={handleInputChange}
            placeholder="e.g., AB12 CDE"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="co2Emission" className="text-base">
            CO2 Emission
          </Label>
          <Input
            id="co2Emission"
            name="co2Emission"
            type="text"
            required
            value={formData.co2Emission}
            onChange={handleInputChange}
            placeholder="e.g., 120g/km"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="call" className="text-base">
            <Phone className="inline-block w-4 h-4 mr-2" />
            Contact Number
          </Label>
          <Input
            id="call"
            name="call"
            type="tel"
            required
            value={formData.call}
            onChange={handleInputChange}
            placeholder="e.g., +44 123 456 7890"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-base">
            City
          </Label>
          <Input
            id="city"
            name="city"
            type="text"
            required
            value={formData.location.city}
            onChange={(e) => handleLocationChange("city", e.target.value)}
            placeholder="Enter city"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-base">
            Country
          </Label>
          <Input
            id="country"
            name="country"
            type="text"
            required
            value={formData.location.country}
            onChange={(e) => handleLocationChange("country", e.target.value)}
            placeholder="Enter country"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude" className="text-base">
            Latitude (Optional)
          </Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            value={formData.location.coordinates.latitude}
            onChange={(e) => handleCoordinatesChange("latitude", e.target.value)}
            placeholder="Enter latitude"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude" className="text-base">
            Longitude (Optional)
          </Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            value={formData.location.coordinates.longitude}
            onChange={(e) => handleCoordinatesChange("longitude", e.target.value)}
            placeholder="Enter longitude"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base">
          <FileText className="inline-block w-4 h-4 mr-2" />
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Provide a detailed description of your vehicle..."
          className="min-h-[150px] resize-y"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={prevStep} variant="outline" className="w-1/2">
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2">
          Next: Upload Images
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          <Label htmlFor="images" className="text-base font-medium">
            Upload Vehicle Images
          </Label>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-10 h-10 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-4">Drag and drop your images here, or click to browse</p>
          <Input
            id="images"
            name="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <Button variant="outline" onClick={() => document.getElementById("images")?.click()} className="mx-auto">
            Browse Files
          </Button>
        </div>

        {imagePreviewUrls.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Selected Images ({imagePreviewUrls.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-md overflow-hidden border border-gray-200">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={prevStep} variant="outline" className="w-1/2">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-1/2">
          {isSubmitting ? "Posting..." : "Post Advertisement"}
        </Button>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      default:
        return renderStep1()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Post Your Vehicle Advertisement</h1>
            <p className="text-gray-600 mt-2">Fill in the details below to list your vehicle for sale</p>
          </div>

          <Card className="shadow-lg border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Car className="w-5 h-5" />
                Vehicle Details
              </CardTitle>
              <CardDescription>Please provide accurate information about your vehicle</CardDescription>
              {renderStepIndicator()}
            </CardHeader>

            <CardContent>
              <form>{renderCurrentStep()}</form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 border-t pt-6">
              <div className="text-sm text-gray-500 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  By posting this advertisement, you confirm that all information provided is accurate and that you own
                  or have permission to sell this vehicle.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
