"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, RefreshCw, AlertCircle, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useDropzone } from "react-dropzone"
import { VehicleType, Car as CarType, Van as VanType, Truck as TruckType, VehicleBase } from "@/types/vehicles"
import { db, storage, auth } from "@/lib/firebase"
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuthState } from 'react-firebase-hooks/auth'

// Interfaces (moved from page.tsx)
interface VehicleData {
  make: string
  model: string
  year: number
  vin: string
  specifications: {
    engine: string
    transmission: string
    fuelType: string
    mileage: number
    color: string
  }
}

interface ListingFormData {
  type: VehicleType
  title: string
  price: string
  make: string
  model: string
  year: string
  mileage: string
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic'
  description: string
  images: File[]
  registrationNumber: string
  color: string
  range: string
  euroStatus: string
  dateOfLastV5CIssued: string
  taxStatus: 'taxed' | 'tax-due' | 'tax-exempt'
  engineCapacity: string
  motStatus: 'passed' | 'failed' | 'due'
  co2Emissions: string
  bodyType?: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon'
  doors?: string
  seats?: string
  cargoVolume?: string
  maxPayload?: string
  length?: string
  height?: string
  axles?: string
  cabType?: 'day' | 'sleeper'
  location: {
    city: string
    country: string
    pincode: string
    coordinates: {
      latitude: string
      longitude: string
    }
  }
}

interface FormErrors {
  [key: string]: string
}

// Constants (moved from page.tsx)
const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' }
] as const

const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'wagon', label: 'Wagon' }
] as const

const CAB_TYPES = [
  { value: 'day', label: 'Day Cab' },
  { value: 'sleeper', label: 'Sleeper Cab' }
] as const

const FUEL_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" }
] as const

const TRANSMISSION_TYPES = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "semi-automatic", label: "Semi-Automatic" }
] as const

const TAX_STATUS = [
  { value: "taxed", label: "Taxed" },
  { value: "tax-due", label: "Tax Due" },
  { value: "tax-exempt", label: "Tax Exempt" }
] as const

const MOT_STATUS = [
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
  { value: "due", label: "Due" }
] as const

const MAX_IMAGES = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AddVehicleForm() {
  const router = useRouter()
  const [user, loading, error] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingVehicleData, setIsFetchingVehicleData] = useState(false)
  const [vin, setVin] = useState("")
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [formData, setFormData] = useState<ListingFormData>({
    type: 'car',
    title: "",
    price: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "petrol",
    transmission: "automatic",
    description: "",
    images: [],
    registrationNumber: "",
    color: "",
    range: "0",
    euroStatus: "",
    dateOfLastV5CIssued: new Date().toISOString(),
    taxStatus: "tax-exempt",
    engineCapacity: "",
    motStatus: "due",
    co2Emissions: "0",
    location: {
      city: "",
      country: "",
      pincode: "",
      coordinates: {
        latitude: "",
        longitude: ""
      }
    }
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    // Required fields validation
    if (!formData.title.trim()) errors.title = "Title is required"
    if (!formData.price.trim()) errors.price = "Price is required"
    if (!formData.make.trim()) errors.make = "Make is required"
    if (!formData.model.trim()) errors.model = "Model is required"
    if (!formData.year.trim()) errors.year = "Year is required"
    if (!formData.mileage.trim()) errors.mileage = "Mileage is required"
    if (!formData.fuelType) errors.fuelType = "Fuel type is required"
    if (!formData.transmission) errors.transmission = "Transmission is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (formData.images.length === 0) errors.images = "At least one image is required"
    if (!formData.registrationNumber.trim()) errors.registrationNumber = "Registration number is required"
    if (!formData.color.trim()) errors.color = "Color is required"
    if (!formData.euroStatus.trim()) errors.euroStatus = "Euro status is required"
    if (!formData.engineCapacity.trim()) errors.engineCapacity = "Engine capacity is required"

    // Numeric validation
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Price must be a positive number"
    }
    if (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear()) {
      errors.year = "Year must be valid"
    }
    if (isNaN(Number(formData.mileage)) || Number(formData.mileage) < 0) {
      errors.mileage = "Mileage must be a positive number"
    }
    if (isNaN(Number(formData.range)) || Number(formData.range) < 0) {
      errors.range = "Range must be a positive number"
    }
    if (isNaN(Number(formData.co2Emissions)) || Number(formData.co2Emissions) < 0) {
      errors.co2Emissions = "CO2 emissions must be a positive number"
    }

    // Location validation
    if (!formData.location.city.trim()) errors["location.city"] = "City is required"
    if (!formData.location.country.trim()) errors["location.country"] = "Country is required"
    if (!formData.location.pincode.trim()) errors["location.pincode"] = "Pincode is required"

    // Type-specific validation
    switch (formData.type) {
      case 'car':
        if (!formData.bodyType) errors.bodyType = "Body type is required"
        if (!formData.doors) errors.doors = "Number of doors is required"
        if (isNaN(Number(formData.doors)) || Number(formData.doors) <= 0) {
          errors.doors = "Doors must be a positive number"
        }
        if (!formData.seats) errors.seats = "Number of seats is required"
        if (isNaN(Number(formData.seats)) || Number(formData.seats) <= 0) {
          errors.seats = "Seats must be a positive number"
        }
        break
      case 'van':
        if (!formData.cargoVolume) errors.cargoVolume = "Cargo volume is required"
        if (isNaN(Number(formData.cargoVolume)) || Number(formData.cargoVolume) <= 0) {
          errors.cargoVolume = "Cargo volume must be a positive number"
        }
        if (!formData.maxPayload) errors.maxPayload = "Max payload is required"
        if (isNaN(Number(formData.maxPayload)) || Number(formData.maxPayload) <= 0) {
          errors.maxPayload = "Max payload must be a positive number"
        }
        if (!formData.length) errors.length = "Length is required"
        if (isNaN(Number(formData.length)) || Number(formData.length) <= 0) {
          errors.length = "Length must be a positive number"
        }
        if (!formData.height) errors.height = "Height is required"
        if (isNaN(Number(formData.height)) || Number(formData.height) <= 0) {
          errors.height = "Height must be a positive number"
        }
        break
      case 'truck':
        if (!formData.maxPayload) errors.maxPayload = "Max payload is required"
        if (isNaN(Number(formData.maxPayload)) || Number(formData.maxPayload) <= 0) {
          errors.maxPayload = "Max payload must be a positive number"
        }
        if (!formData.axles) errors.axles = "Number of axles is required"
        if (isNaN(Number(formData.axles)) || Number(formData.axles) <= 0) {
          errors.axles = "Axles must be a positive number"
        }
        if (!formData.cabType) errors.cabType = "Cab type is required"
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleVinSubmit = async () => {
    if (!vin.trim()) {
      toast.error("Please enter a VIN")
      return
    }
    setIsFetchingVehicleData(true)
    try {
      // TODO: Implement actual API call
      const mockData: VehicleData = {
        make: "Toyota", model: "Camry", year: 2023, vin: vin,
        specifications: { engine: "2.5L 4-Cylinder", transmission: "Automatic", fuelType: "Gasoline", mileage: 0, color: "Silver" }
      }
      setVehicleData(mockData)
      setFormData(prev => ({
        ...prev,
        make: mockData.make, model: mockData.model, year: mockData.year.toString(),
        fuelType: mockData.specifications.fuelType.toLowerCase() as 'petrol' | 'diesel' | 'electric' | 'hybrid',
        transmission: mockData.specifications.transmission.toLowerCase() as 'manual' | 'automatic'
      }))
      toast.success("Vehicle data fetched successfully")
    } catch (error) {
      toast.error("Failed to fetch vehicle data")
      console.error("Error fetching vehicle data:", error)
    } finally {
      setIsFetchingVehicleData(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })
    if (formData.images.length + validFiles.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }))
  }, [formData.images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }, maxSize: MAX_FILE_SIZE
  })

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to create a listing")
      return
    }
    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }
    setIsLoading(true)

    try {
      // Get coordinates from pincode
      const coordinates = await getCoordinatesFromPincode(
        formData.location.pincode,
        formData.location.city,
        formData.location.country
      )
      
      // Update form data with coordinates
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates
        }
      }))

      const vehicleId = doc(collection(db, "vehicles")).id

      // Upload images
      const imageUrls: string[] = []
      for (const image of formData.images) {
        const imagePath = `vehicles/${vehicleId}/${image.name}`
        const imageRef = ref(storage, imagePath)
        try {
          await uploadBytes(imageRef, image)
          const downloadURL = await getDownloadURL(imageRef)
          imageUrls.push(downloadURL)
        } catch (uploadError) {
          console.error(`Error uploading image ${image.name}:`, uploadError)
          throw new Error(`Failed to upload image: ${image.name}`)
        }
      }

      const vehicleDataFromForm = {
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        description: formData.description,
        registrationNumber: formData.registrationNumber,
        color: formData.color,
        range: Number(formData.range),
        euroStatus: formData.euroStatus,
        dateOfLastV5CIssued: new Date(formData.dateOfLastV5CIssued),
        taxStatus: formData.taxStatus,
        engineCapacity: formData.engineCapacity,
        motStatus: formData.motStatus,
        co2Emissions: Number(formData.co2Emissions),
      }

      let vehicleToSubmit: CarType | VanType | TruckType

      switch (formData.type) {
        case 'car':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            id: vehicleId,
            type: 'car',
            bodyType: formData.bodyType as CarType['bodyType'],
            doors: Number(formData.doors),
            seats: Number(formData.seats),
            features: [],
            location: {
              city: formData.location.city,
              country: formData.location.country,
              coordinates: {
                latitude: Number(formData.location.coordinates.latitude),
                longitude: Number(formData.location.coordinates.longitude)
              }
            },
            images: imageUrls,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'available' as const,
            dealerUid: user?.uid || "N/A"
          } as unknown as CarType
          break
        case 'van':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            id: vehicleId,
            type: 'van',
            cargoVolume: Number(formData.cargoVolume!),
            maxPayload: Number(formData.maxPayload!),
            length: Number(formData.length!),
            height: Number(formData.height!),
            features: [],
            location: {
              city: formData.location.city,
              country: formData.location.country,
              coordinates: {
                latitude: Number(formData.location.coordinates.latitude),
                longitude: Number(formData.location.coordinates.longitude)
              }
            },
            images: imageUrls,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'available' as const,
            dealerUid: user?.uid || "N/A"
          } as unknown as VanType
          break
        case 'truck':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            id: vehicleId,
            type: 'truck',
            maxPayload: Number(formData.maxPayload!),
            axles: Number(formData.axles!),
            cabType: formData.cabType as TruckType['cabType'],
            features: [],
            location: {
              city: formData.location.city,
              country: formData.location.country,
              coordinates: {
                latitude: Number(formData.location.coordinates.latitude),
                longitude: Number(formData.location.coordinates.longitude)
              }
            },
            images: imageUrls,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'available' as const,
            dealerUid: user?.uid || "N/A"
          } as unknown as TruckType
          break
        default:
          toast.error("Invalid vehicle type selected.")
          setIsLoading(false)
          return
      }

      console.log("Creating vehicle data in Firestore:", vehicleToSubmit)
      await setDoc(doc(db, "vehicles", vehicleId), vehicleToSubmit)
      toast.success("Listing created successfully")
      router.push("/dealer/dashboard")
    } catch (error) {
      console.error("Error creating listing:", error)
      let errorMessage = "Failed to create listing."
      if (error instanceof Error) {
        errorMessage += ` ${error.message}`
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (field: keyof ListingFormData, value: string | VehicleType) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
    if (formErrors[`location.${field}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`location.${field}`]
        return newErrors
      })
    }
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
    if (formErrors[`location.coordinates.${field}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`location.coordinates.${field}`]
        return newErrors
      })
    }
  }

  const getCoordinatesFromPincode = async (pincode: string, city: string, country: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${pincode} ${city} ${country}`
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat.toString(), longitude: lng.toString() };
      }
      throw new Error('No results found');
    } catch (error) {
      console.error('Error getting coordinates:', error);
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* VIN Lookup Section */}
      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label>Vehicle Identification Number (VIN)</Label>
            <Input
              placeholder="Enter VIN to fetch vehicle details"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            type="button"
            onClick={handleVinSubmit}
            disabled={isFetchingVehicleData}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isFetchingVehicleData ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Fetching...</>
            ) : (
              <><Database className="w-4 h-4 mr-2" /> Fetch Details</>
            )}
          </Button>
        </div>
        {vehicleData && (
          <Alert className="bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Vehicle Found</AlertTitle>
            <AlertDescription>{vehicleData.year} {vehicleData.make} {vehicleData.model}</AlertDescription>
          </Alert>
        )}
      </div>

      <Separator className="my-6" />

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleFormChange("type", value as VehicleType)}>
              <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={formData.title} onChange={(e) => handleFormChange("title", e.target.value)} placeholder="e.g., 2023 Toyota Camry XSE" required className={formErrors.title ? "border-red-500" : ""} />
            {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input type="number" value={formData.price} onChange={(e) => handleFormChange("price", e.target.value)} placeholder="Enter price" required className={formErrors.price ? "border-red-500" : ""} />
            {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
          </div>
          <div className="space-y-2">
            <Label>Make</Label>
            <Input value={formData.make} onChange={(e) => handleFormChange("make", e.target.value)} placeholder="Vehicle make" required className={formErrors.make ? "border-red-500" : ""} />
            {formErrors.make && <p className="text-sm text-red-500">{formErrors.make}</p>}
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Input value={formData.model} onChange={(e) => handleFormChange("model", e.target.value)} placeholder="Vehicle model" required className={formErrors.model ? "border-red-500" : ""} />
            {formErrors.model && <p className="text-sm text-red-500">{formErrors.model}</p>}
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Input type="number" value={formData.year} onChange={(e) => handleFormChange("year", e.target.value)} placeholder="Vehicle year" required className={formErrors.year ? "border-red-500" : ""} />
            {formErrors.year && <p className="text-sm text-red-500">{formErrors.year}</p>}
          </div>
          <div className="space-y-2">
            <Label>Mileage</Label>
            <Input type="number" value={formData.mileage} onChange={(e) => handleFormChange("mileage", e.target.value)} placeholder="Vehicle mileage" required className={formErrors.mileage ? "border-red-500" : ""} />
            {formErrors.mileage && <p className="text-sm text-red-500">{formErrors.mileage}</p>}
          </div>
          <div className="space-y-2">
            <Label>Fuel Type</Label>
            <Select value={formData.fuelType} onValueChange={(value) => handleFormChange("fuelType", value as 'petrol' | 'diesel' | 'electric' | 'hybrid')}>
              <SelectTrigger className={formErrors.fuelType ? "border-red-500" : ""}><SelectValue placeholder="Select fuel type" /></SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
              </SelectContent>
            </Select>
            {formErrors.fuelType && <p className="text-sm text-red-500">{formErrors.fuelType}</p>}
          </div>
          <div className="space-y-2">
            <Label>Transmission</Label>
            <Select value={formData.transmission} onValueChange={(value) => handleFormChange("transmission", value as 'manual' | 'automatic')}>
              <SelectTrigger className={formErrors.transmission ? "border-red-500" : ""}><SelectValue placeholder="Select transmission" /></SelectTrigger>
              <SelectContent>
                {TRANSMISSION_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
              </SelectContent>
            </Select>
            {formErrors.transmission && <p className="text-sm text-red-500">{formErrors.transmission}</p>}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Common Vehicle Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Vehicle Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <Input
              value={formData.registrationNumber}
              onChange={(e) => handleFormChange("registrationNumber", e.target.value)}
              placeholder="Enter registration number"
              required
              className={formErrors.registrationNumber ? "border-red-500" : ""}
            />
            {formErrors.registrationNumber && (
              <p className="text-sm text-red-500">{formErrors.registrationNumber}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Input
              value={formData.color}
              onChange={(e) => handleFormChange("color", e.target.value)}
              placeholder="Enter vehicle color"
              required
              className={formErrors.color ? "border-red-500" : ""}
            />
            {formErrors.color && (
              <p className="text-sm text-red-500">{formErrors.color}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Range (miles)</Label>
            <Input
              type="number"
              value={formData.range}
              onChange={(e) => handleFormChange("range", e.target.value)}
              placeholder="Enter vehicle range"
              required
              className={formErrors.range ? "border-red-500" : ""}
            />
            {formErrors.range && (
              <p className="text-sm text-red-500">{formErrors.range}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Euro Status</Label>
            <Input
              value={formData.euroStatus}
              onChange={(e) => handleFormChange("euroStatus", e.target.value)}
              placeholder="Enter Euro status"
              required
              className={formErrors.euroStatus ? "border-red-500" : ""}
            />
            {formErrors.euroStatus && (
              <p className="text-sm text-red-500">{formErrors.euroStatus}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Date of Last V5C Issued</Label>
            <Input
              type="date"
              value={formData.dateOfLastV5CIssued}
              onChange={(e) => handleFormChange("dateOfLastV5CIssued", e.target.value)}
              required
              className={formErrors.dateOfLastV5CIssued ? "border-red-500" : ""}
            />
            {formErrors.dateOfLastV5CIssued && (
              <p className="text-sm text-red-500">{formErrors.dateOfLastV5CIssued}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Tax Status</Label>
            <Select
              value={formData.taxStatus}
              onValueChange={(value) => handleFormChange("taxStatus", value as 'taxed' | 'tax-due' | 'tax-exempt')}
            >
              <SelectTrigger className={formErrors.taxStatus ? "border-red-500" : ""}>
                <SelectValue placeholder="Select tax status" />
              </SelectTrigger>
              <SelectContent>
                {TAX_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.taxStatus && (
              <p className="text-sm text-red-500">{formErrors.taxStatus}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Engine Capacity</Label>
            <Input
              value={formData.engineCapacity}
              onChange={(e) => handleFormChange("engineCapacity", e.target.value)}
              placeholder="Enter engine capacity"
              required
              className={formErrors.engineCapacity ? "border-red-500" : ""}
            />
            {formErrors.engineCapacity && (
              <p className="text-sm text-red-500">{formErrors.engineCapacity}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>MOT Status</Label>
            <Select
              value={formData.motStatus}
              onValueChange={(value) => handleFormChange("motStatus", value as 'passed' | 'failed' | 'due')}
            >
              <SelectTrigger className={formErrors.motStatus ? "border-red-500" : ""}>
                <SelectValue placeholder="Select MOT status" />
              </SelectTrigger>
              <SelectContent>
                {MOT_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.motStatus && (
              <p className="text-sm text-red-500">{formErrors.motStatus}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>CO2 Emissions (g/km)</Label>
            <Input
              type="number"
              value={formData.co2Emissions}
              onChange={(e) => handleFormChange("co2Emissions", e.target.value)}
              placeholder="Enter CO2 emissions"
              required
              className={formErrors.co2Emissions ? "border-red-500" : ""}
            />
            {formErrors.co2Emissions && (
              <p className="text-sm text-red-500">{formErrors.co2Emissions}</p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Location Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={formData.location.city}
              onChange={(e) => handleLocationChange("city", e.target.value)}
              placeholder="Enter city"
              required
              className={formErrors['location.city'] ? "border-red-500" : ""}
            />
            {formErrors['location.city'] && (
              <p className="text-sm text-red-500">{formErrors['location.city']}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={formData.location.country}
              onChange={(e) => handleLocationChange("country", e.target.value)}
              placeholder="Enter country"
              required
              className={formErrors['location.country'] ? "border-red-500" : ""}
            />
            {formErrors['location.country'] && (
              <p className="text-sm text-red-500">{formErrors['location.country']}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Pincode</Label>
            <Input
              value={formData.location.pincode}
              onChange={(e) => handleLocationChange("pincode", e.target.value)}
              placeholder="Enter pincode"
              required
              className={formErrors['location.pincode'] ? "border-red-500" : ""}
            />
            {formErrors['location.pincode'] && (
              <p className="text-sm text-red-500">{formErrors['location.pincode']}</p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Type-specific Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Type-specific Details</h3>
        {formData.type === 'car' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Body Type</Label>
              <Select
                value={formData.bodyType}
                onValueChange={(value) => handleFormChange("bodyType", value as 'hatchback' | 'saloon' | 'suv' | 'coupe' | 'convertible' | 'estate' | 'mpv')}
              >
                <SelectTrigger className={formErrors.bodyType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  {BODY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.bodyType && (
                <p className="text-sm text-red-500">{formErrors.bodyType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Number of Doors</Label>
              <Input
                type="number"
                value={formData.doors}
                onChange={(e) => handleFormChange("doors", e.target.value)}
                placeholder="Enter number of doors"
                required
                className={formErrors.doors ? "border-red-500" : ""}
              />
              {formErrors.doors && (
                <p className="text-sm text-red-500">{formErrors.doors}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Number of Seats</Label>
              <Input
                type="number"
                value={formData.seats}
                onChange={(e) => handleFormChange("seats", e.target.value)}
                placeholder="Enter number of seats"
                required
                className={formErrors.seats ? "border-red-500" : ""}
              />
              {formErrors.seats && (
                <p className="text-sm text-red-500">{formErrors.seats}</p>
              )}
            </div>
          </div>
        )}

        {formData.type === 'van' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cargo Volume (m³)</Label>
              <Input
                type="number"
                value={formData.cargoVolume}
                onChange={(e) => handleFormChange("cargoVolume", e.target.value)}
                placeholder="Enter cargo volume"
                required
                className={formErrors.cargoVolume ? "border-red-500" : ""}
              />
              {formErrors.cargoVolume && (
                <p className="text-sm text-red-500">{formErrors.cargoVolume}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Max Payload (kg)</Label>
              <Input
                type="number"
                value={formData.maxPayload}
                onChange={(e) => handleFormChange("maxPayload", e.target.value)}
                placeholder="Enter max payload"
                required
                className={formErrors.maxPayload ? "border-red-500" : ""}
              />
              {formErrors.maxPayload && (
                <p className="text-sm text-red-500">{formErrors.maxPayload}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Length (m)</Label>
              <Input
                type="number"
                value={formData.length}
                onChange={(e) => handleFormChange("length", e.target.value)}
                placeholder="Enter length"
                required
                className={formErrors.length ? "border-red-500" : ""}
              />
              {formErrors.length && (
                <p className="text-sm text-red-500">{formErrors.length}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Height (m)</Label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => handleFormChange("height", e.target.value)}
                placeholder="Enter height"
                required
                className={formErrors.height ? "border-red-500" : ""}
              />
              {formErrors.height && (
                <p className="text-sm text-red-500">{formErrors.height}</p>
              )}
            </div>
          </div>
        )}

        {formData.type === 'truck' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Payload (kg)</Label>
              <Input
                type="number"
                value={formData.maxPayload}
                onChange={(e) => handleFormChange("maxPayload", e.target.value)}
                placeholder="Enter max payload"
                required
                className={formErrors.maxPayload ? "border-red-500" : ""}
              />
              {formErrors.maxPayload && (
                <p className="text-sm text-red-500">{formErrors.maxPayload}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Number of Axles</Label>
              <Input
                type="number"
                value={formData.axles}
                onChange={(e) => handleFormChange("axles", e.target.value)}
                placeholder="Enter number of axles"
                required
                className={formErrors.axles ? "border-red-500" : ""}
              />
              {formErrors.axles && (
                <p className="text-sm text-red-500">{formErrors.axles}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Cab Type</Label>
              <Select
                value={formData.cabType}
                onValueChange={(value) => handleFormChange("cabType", value as 'day' | 'sleeper' | 'crew')}
              >
                <SelectTrigger className={formErrors.cabType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select cab type" />
                </SelectTrigger>
                <SelectContent>
                  {CAB_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.cabType && (
                <p className="text-sm text-red-500">{formErrors.cabType}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => handleFormChange("description", e.target.value)} placeholder="Enter vehicle description" rows={4} required className={formErrors.description ? "border-red-500" : ""} />
        {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
      </div>

      {/* Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Images</Label>
          <p className="text-sm text-gray-500">{formData.images.length}/{MAX_IMAGES} images</p>
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <input {...getInputProps()} />
          <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">{isDragActive ? "Drop the images here" : "Drag and drop images here, or click to select"}</p>
          <p className="text-xs text-gray-400 mt-1">Max {MAX_IMAGES} images, up to 5MB each</p>
        </div>
        {formErrors.images && <p className="text-sm text-red-500">{formErrors.images}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.map((file, index) => (
            <div key={index} className="relative group">
              <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
              <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dealer/dashboard")}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "Creating..." : "Create Listing"}
        </Button>
      </div>
    </form>
  )
} 