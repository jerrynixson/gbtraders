"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, RefreshCw, Upload, AlertCircle, FileSpreadsheet, ArrowLeft, X, Image as ImageIcon, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDropzone } from "react-dropzone"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
  type: 'car' | 'van' | 'truck'
  title: string
  price: string
  make: string
  model: string
  year: string
  mileage: string
  fuel: string
  transmission: string
  description: string
  images: (File | string)[]
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
    coordinates: {
      latitude: string
      longitude: string
    }
  }
}

interface FormErrors {
  [key: string]: string
}

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

const MAX_IMAGES = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
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
    fuel: "",
    transmission: "",
    description: "",
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
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingRef = doc(db, "vehicles", resolvedParams.id)
        const listingDoc = await getDoc(listingRef)

        if (!listingDoc.exists()) {
          toast.error("Listing not found")
          router.push("/dealer/dashboard")
          return
        }

        const listingData = listingDoc.data()
        console.log("Fetched listing data:", listingData) // Debug log

        setFormData({
          type: listingData.type || 'car',
          title: listingData.title || "",
          price: listingData.price?.toString() || "",
          make: listingData.make || "",
          model: listingData.model || "",
          year: listingData.year?.toString() || "",
          mileage: listingData.mileage?.toString() || "",
          fuel: listingData.fuel || "",
          transmission: listingData.transmission || "",
          description: listingData.description || "",
          images: listingData.images || [],
          bodyType: listingData.bodyType,
          doors: listingData.doors?.toString(),
          seats: listingData.seats?.toString(),
          cargoVolume: listingData.cargoVolume?.toString(),
          maxPayload: listingData.maxPayload?.toString(),
          length: listingData.length?.toString(),
          height: listingData.height?.toString(),
          axles: listingData.axles?.toString(),
          cabType: listingData.cabType,
          location: {
            city: listingData.location?.city || "",
            country: listingData.location?.country || "",
            coordinates: {
              latitude: listingData.location?.coordinates?.latitude?.toString() || "",
              longitude: listingData.location?.coordinates?.longitude?.toString() || ""
            }
          }
        })
      } catch (error) {
        console.error("Error fetching listing:", error)
        toast.error("Failed to fetch listing")
        router.push("/dealer/dashboard")
      }
    }

    fetchListing()
  }, [resolvedParams.id, router])

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!formData.title.trim()) errors.title = "Title is required"
    if (!formData.price.trim()) errors.price = "Price is required"
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Price must be a positive number"
    }
    if (!formData.make.trim()) errors.make = "Make is required"
    if (!formData.model.trim()) errors.model = "Model is required"
    if (!formData.year.trim()) errors.year = "Year is required"
    if (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear()) {
      errors.year = "Year must be valid"
    }
    if (!formData.mileage.trim()) errors.mileage = "Mileage is required"
    if (isNaN(Number(formData.mileage)) || Number(formData.mileage) < 0) {
      errors.mileage = "Mileage must be a positive number"
    }
    if (!formData.fuel) errors.fuel = "Fuel type is required"
    if (!formData.transmission) errors.transmission = "Transmission is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (formData.images.length === 0) errors.images = "At least one image is required"

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
        make: "Toyota",
        model: "Camry",
        year: 2023,
        vin: vin,
        specifications: {
          engine: "2.5L 4-Cylinder",
          transmission: "Automatic",
          fuelType: "Gasoline",
          mileage: 0,
          color: "Silver"
        }
      }
      setVehicleData(mockData)
      setFormData(prev => ({
        ...prev,
        make: mockData.make,
        model: mockData.model,
        year: mockData.year.toString(),
        fuel: mockData.specifications.fuelType.toLowerCase(),
        transmission: mockData.specifications.transmission.toLowerCase()
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

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }))
  }, [formData.images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: MAX_FILE_SIZE
  })

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(formData.images)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFormData(prev => ({
      ...prev,
      images: items
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    setIsLoading(true)
    try {
      const listingRef = doc(db, "vehicles", resolvedParams.id)
      const updateData = {
        type: formData.type,
        title: formData.title,
        price: Number(formData.price),
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        fuel: formData.fuel,
        transmission: formData.transmission,
        description: formData.description,
        images: formData.images,
        bodyType: formData.bodyType,
        doors: formData.doors ? Number(formData.doors) : undefined,
        seats: formData.seats ? Number(formData.seats) : undefined,
        cargoVolume: formData.cargoVolume ? Number(formData.cargoVolume) : undefined,
        maxPayload: formData.maxPayload ? Number(formData.maxPayload) : undefined,
        length: formData.length ? Number(formData.length) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        axles: formData.axles ? Number(formData.axles) : undefined,
        cabType: formData.cabType,
        location: {
          city: formData.location.city,
          country: formData.location.country,
          coordinates: {
            latitude: Number(formData.location.coordinates.latitude),
            longitude: Number(formData.location.coordinates.longitude)
          }
        },
        updatedAt: new Date().toISOString()
      }

      console.log("Updating listing with data:", updateData)
      await updateDoc(listingRef, updateData)
      toast.success("Listing updated successfully")
      router.push("/dealer/dashboard")
    } catch (error) {
      console.error("Error updating listing:", error)
      toast.error("Failed to update listing")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (field: keyof ListingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleLocationChange = (field: keyof ListingFormData['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
  }

  const handleCoordinatesChange = (field: keyof ListingFormData['location']['coordinates'], value: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/dealer/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Edit Listing</CardTitle>
            <CardDescription>
              Update your vehicle listing details
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        Fetch Details
                      </>
                    )}
                  </Button>
                </div>
                {vehicleData && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Vehicle Found</AlertTitle>
                    <AlertDescription>
                      {vehicleData.year} {vehicleData.make} {vehicleData.model}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Vehicle Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vehicle Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleFormChange("type", value as 'car' | 'van' | 'truck')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === 'car' && (
                    <div className="space-y-2">
                      <Label>Body Type</Label>
                      <Select
                        value={formData.bodyType}
                        onValueChange={(value) => handleFormChange("bodyType", value as 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon')}
                      >
                        <SelectTrigger>
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
                    </div>
                  )}

                  {formData.type === 'truck' && (
                    <div className="space-y-2">
                      <Label>Cab Type</Label>
                      <Select
                        value={formData.cabType}
                        onValueChange={(value) => handleFormChange("cabType", value as 'day' | 'sleeper')}
                      >
                        <SelectTrigger>
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
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.location.city}
                      onChange={(e) => handleLocationChange("city", e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={formData.location.country}
                      onChange={(e) => handleLocationChange("country", e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      value={formData.location.coordinates.latitude}
                      onChange={(e) => handleCoordinatesChange("latitude", e.target.value)}
                      placeholder="Enter latitude"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      value={formData.location.coordinates.longitude}
                      onChange={(e) => handleCoordinatesChange("longitude", e.target.value)}
                      placeholder="Enter longitude"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle-specific fields */}
              {formData.type === 'car' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Car Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Doors</Label>
                      <Input
                        type="number"
                        value={formData.doors}
                        onChange={(e) => handleFormChange("doors", e.target.value)}
                        placeholder="Number of doors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Seats</Label>
                      <Input
                        type="number"
                        value={formData.seats}
                        onChange={(e) => handleFormChange("seats", e.target.value)}
                        placeholder="Number of seats"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'van' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Van Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cargo Volume (m³)</Label>
                      <Input
                        type="number"
                        value={formData.cargoVolume}
                        onChange={(e) => handleFormChange("cargoVolume", e.target.value)}
                        placeholder="Cargo volume"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Payload (kg)</Label>
                      <Input
                        type="number"
                        value={formData.maxPayload}
                        onChange={(e) => handleFormChange("maxPayload", e.target.value)}
                        placeholder="Maximum payload"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Length (m)</Label>
                      <Input
                        type="number"
                        value={formData.length}
                        onChange={(e) => handleFormChange("length", e.target.value)}
                        placeholder="Vehicle length"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (m)</Label>
                      <Input
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleFormChange("height", e.target.value)}
                        placeholder="Vehicle height"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'truck' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Truck Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Max Payload (kg)</Label>
                      <Input
                        type="number"
                        value={formData.maxPayload}
                        onChange={(e) => handleFormChange("maxPayload", e.target.value)}
                        placeholder="Maximum payload"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Axles</Label>
                      <Input
                        type="number"
                        value={formData.axles}
                        onChange={(e) => handleFormChange("axles", e.target.value)}
                        placeholder="Number of axles"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      placeholder="e.g., 2023 Toyota Camry XSE"
                      required
                      className={formErrors.title ? "border-red-500" : ""}
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-500">{formErrors.title}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                      placeholder="Enter price"
                      required
                      className={formErrors.price ? "border-red-500" : ""}
                    />
                    {formErrors.price && (
                      <p className="text-sm text-red-500">{formErrors.price}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <Input
                      value={formData.make}
                      onChange={(e) => handleFormChange("make", e.target.value)}
                      placeholder="Vehicle make"
                      required
                      className={formErrors.make ? "border-red-500" : ""}
                    />
                    {formErrors.make && (
                      <p className="text-sm text-red-500">{formErrors.make}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => handleFormChange("model", e.target.value)}
                      placeholder="Vehicle model"
                      required
                      className={formErrors.model ? "border-red-500" : ""}
                    />
                    {formErrors.model && (
                      <p className="text-sm text-red-500">{formErrors.model}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleFormChange("year", e.target.value)}
                      placeholder="Vehicle year"
                      required
                      className={formErrors.year ? "border-red-500" : ""}
                    />
                    {formErrors.year && (
                      <p className="text-sm text-red-500">{formErrors.year}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Mileage</Label>
                    <Input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => handleFormChange("mileage", e.target.value)}
                      placeholder="Vehicle mileage"
                      required
                      className={formErrors.mileage ? "border-red-500" : ""}
                    />
                    {formErrors.mileage && (
                      <p className="text-sm text-red-500">{formErrors.mileage}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select
                      value={formData.fuel}
                      onValueChange={(value) => handleFormChange("fuel", value)}
                    >
                      <SelectTrigger className={formErrors.fuel ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.fuel && (
                      <p className="text-sm text-red-500">{formErrors.fuel}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => handleFormChange("transmission", value)}
                    >
                      <SelectTrigger className={formErrors.transmission ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select transmission" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSMISSION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.transmission && (
                      <p className="text-sm text-red-500">{formErrors.transmission}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Enter vehicle description"
                  rows={4}
                  required
                  className={formErrors.description ? "border-red-500" : ""}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500">{formErrors.description}</p>
                )}
              </div>

              <Separator />

              {/* Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Images</Label>
                  <p className="text-sm text-gray-500">
                    {formData.images.length}/{MAX_IMAGES} images
                  </p>
                </div>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input {...getInputProps()} />
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {isDragActive
                      ? "Drop the images here"
                      : "Drag and drop images here, or click to select"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Max {MAX_IMAGES} images, up to 5MB each
                  </p>
                </div>
                {formErrors.images && (
                  <p className="text-sm text-red-500">{formErrors.images}</p>
                )}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="images" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        {formData.images.map((image, index) => (
                          <Draggable
                            key={index}
                            draggableId={`image-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="relative group"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-1 left-1 p-1 bg-gray-800/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <img
                                  src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dealer/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
} 