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
import { db, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { VehicleType, Car as CarType, Van as VanType, Truck as TruckType, VehicleBase } from "@/types/vehicles"

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
  existingImages: string[]
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
    coordinates: {
      latitude: string
      longitude: string
    }
  }
}

interface FormErrors {
  [key: string]: string
}

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
  { value: "manual", label: "Manual" }
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
    fuelType: "petrol",
    transmission: "automatic",
    description: "",
    images: [],
    existingImages: [],
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
      if (!resolvedParams.id) {
        toast.error("Invalid listing ID")
        router.push("/dealer/dashboard")
        return
      }

      try {
        const listingRef = doc(db, "vehicles", resolvedParams.id)
        const listingDoc = await getDoc(listingRef)

        if (!listingDoc.exists()) {
          toast.error("Listing not found")
          router.push("/dealer/dashboard")
          return
        }

        const listingData = listingDoc.data()
        console.log("Fetched listing data:", listingData)

        setFormData({
          type: listingData.type || 'car',
          title: listingData.title || "",
          price: listingData.price?.toString() || "",
          make: listingData.make || "",
          model: listingData.model || "",
          year: listingData.year?.toString() || "",
          mileage: listingData.mileage?.toString() || "",
          fuelType: listingData.fuelType || "petrol",
          transmission: listingData.transmission || "automatic",
          description: listingData.description || "",
          images: [],
          existingImages: listingData.images || [],
          registrationNumber: listingData.registrationNumber || "",
          color: listingData.color || "",
          range: listingData.range?.toString() || "",
          euroStatus: listingData.euroStatus || "",
          dateOfLastV5CIssued: listingData.dateOfLastV5CIssued?.toDate?.()?.toISOString() || new Date().toISOString(),
          taxStatus: listingData.taxStatus || "tax-exempt",
          engineCapacity: listingData.engineCapacity || "",
          motStatus: listingData.motStatus || "due",
          co2Emissions: listingData.co2Emissions?.toString() || "",
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
    if (isNaN(Number(formData.location.coordinates.latitude))) {
      errors["location.coordinates.latitude"] = "Latitude must be a valid number"
    }
    if (isNaN(Number(formData.location.coordinates.longitude))) {
      errors["location.coordinates.longitude"] = "Longitude must be a valid number"
    }

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from([...formData.existingImages, ...formData.images.map(img => URL.createObjectURL(img))])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Split the reordered items back into existing and new images
    const existingImages = items.filter(url => formData.existingImages.includes(url))
    const newImages = formData.images.filter((_, index) => {
      const url = URL.createObjectURL(formData.images[index])
      return items.includes(url)
    })

    setFormData(prev => ({
      ...prev,
      existingImages,
      images: newImages
    }))
  }

  const removeImage = (index: number) => {
    const totalImages = [...formData.existingImages, ...formData.images.map(img => URL.createObjectURL(img))]
    const url = totalImages[index]

    if (formData.existingImages.includes(url)) {
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter(img => img !== url)
      }))
    } else {
      const newImageIndex = formData.images.findIndex(img => URL.createObjectURL(img) === url)
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== newImageIndex)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }

    setIsLoading(true)
    try {
      // Get existing images from the database
      const listingRef = doc(db, "vehicles", resolvedParams.id)
      const listingDoc = await getDoc(listingRef)
      const existingData = listingDoc.data()

      // Upload new images
      const newImageUrls: string[] = []
      for (const image of formData.images) {
        const imagePath = `vehicles/${resolvedParams.id}/${image.name}`
        const imageRef = ref(storage, imagePath)
        try {
          await uploadBytes(imageRef, image)
          const downloadURL = await getDownloadURL(imageRef)
          newImageUrls.push(downloadURL)
        } catch (uploadError) {
          console.error(`Error uploading image ${image.name}:`, uploadError)
          throw new Error(`Failed to upload image: ${image.name}`)
        }
      }

      // Combine existing and new images in the correct order
      const allImages = [...formData.existingImages, ...newImageUrls]

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
        location: {
          city: formData.location.city,
          country: formData.location.country,
          coordinates: {
            latitude: Number(formData.location.coordinates.latitude) || 0,
            longitude: Number(formData.location.coordinates.longitude) || 0
          }
        },
        images: allImages,
        updatedAt: new Date(),
        status: 'available' as const,
        dealerUid: existingData?.dealerUid || "N/A"
      }

      let vehicleToSubmit: Partial<CarType | VanType | TruckType>

      switch (formData.type) {
        case 'car':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            type: 'car',
            bodyType: formData.bodyType,
            doors: Number(formData.doors),
            seats: Number(formData.seats),
            features: existingData?.features || []
          }
          break
        case 'van':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            type: 'van',
            cargoVolume: Number(formData.cargoVolume!),
            maxPayload: Number(formData.maxPayload!),
            length: Number(formData.length!),
            height: Number(formData.height!),
            features: existingData?.features || []
          }
          break
        case 'truck':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            type: 'truck',
            maxPayload: Number(formData.maxPayload!),
            axles: Number(formData.axles!),
            cabType: formData.cabType,
            features: existingData?.features || []
          }
          break
        default:
          toast.error("Invalid vehicle type selected.")
          setIsLoading(false)
          return
      }

      console.log("Updating vehicle data in Firestore:", vehicleToSubmit)
      await updateDoc(listingRef, vehicleToSubmit)
      toast.success("Listing updated successfully")
      router.push("/dealer/dashboard")
    } catch (error) {
      console.error("Error updating listing:", error)
      let errorMessage = "Failed to update listing."
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

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleFormChange("type", value as VehicleType)}
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
                      value={formData.fuelType}
                      onValueChange={(value) => handleFormChange("fuelType", value as 'petrol' | 'diesel' | 'electric' | 'hybrid')}
                    >
                      <SelectTrigger className={formErrors.fuelType ? "border-red-500" : ""}>
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
                    {formErrors.fuelType && (
                      <p className="text-sm text-red-500">{formErrors.fuelType}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select
                      value={formData.transmission}
                      onValueChange={(value) => handleFormChange("transmission", value as 'manual' | 'automatic')}
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

              {/* Common Vehicle Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Common Vehicle Details</h3>
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
                      placeholder="Enter range in miles"
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
                      value={formData.dateOfLastV5CIssued.split('T')[0]}
                      onChange={(e) => handleFormChange("dateOfLastV5CIssued", new Date(e.target.value).toISOString())}
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
                    <Label>CO2 Emissions</Label>
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

              <Separator />

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
                      className={formErrors["location.city"] ? "border-red-500" : ""}
                    />
                    {formErrors["location.city"] && (
                      <p className="text-sm text-red-500">{formErrors["location.city"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={formData.location.country}
                      onChange={(e) => handleLocationChange("country", e.target.value)}
                      placeholder="Enter country"
                      required
                      className={formErrors["location.country"] ? "border-red-500" : ""}
                    />
                    {formErrors["location.country"] && (
                      <p className="text-sm text-red-500">{formErrors["location.country"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Latitude (Optional)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.location.coordinates.latitude}
                      onChange={(e) => handleCoordinatesChange("latitude", e.target.value)}
                      placeholder="Enter latitude"
                      className={formErrors["location.coordinates.latitude"] ? "border-red-500" : ""}
                    />
                    {formErrors["location.coordinates.latitude"] && (
                      <p className="text-sm text-red-500">{formErrors["location.coordinates.latitude"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude (Optional)</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.location.coordinates.longitude}
                      onChange={(e) => handleCoordinatesChange("longitude", e.target.value)}
                      placeholder="Enter longitude"
                      className={formErrors["location.coordinates.longitude"] ? "border-red-500" : ""}
                    />
                    {formErrors["location.coordinates.longitude"] && (
                      <p className="text-sm text-red-500">{formErrors["location.coordinates.longitude"]}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Type-specific Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Type-specific Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.type === 'car' && (
                    <>
                      <div className="space-y-2">
                        <Label>Body Type</Label>
                        <Select
                          value={formData.bodyType}
                          onValueChange={(value) => handleFormChange("bodyType", value)}
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
                          className={formErrors.seats ? "border-red-500" : ""}
                        />
                        {formErrors.seats && (
                          <p className="text-sm text-red-500">{formErrors.seats}</p>
                        )}
                      </div>
                    </>
                  )}

                  {formData.type === 'van' && (
                    <>
                      <div className="space-y-2">
                        <Label>Cargo Volume (m³)</Label>
                        <Input
                          type="number"
                          value={formData.cargoVolume}
                          onChange={(e) => handleFormChange("cargoVolume", e.target.value)}
                          placeholder="Enter cargo volume"
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
                          className={formErrors.height ? "border-red-500" : ""}
                        />
                        {formErrors.height && (
                          <p className="text-sm text-red-500">{formErrors.height}</p>
                        )}
                      </div>
                    </>
                  )}

                  {formData.type === 'truck' && (
                    <>
                      <div className="space-y-2">
                        <Label>Max Payload (kg)</Label>
                        <Input
                          type="number"
                          value={formData.maxPayload}
                          onChange={(e) => handleFormChange("maxPayload", e.target.value)}
                          placeholder="Enter max payload"
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
                          onValueChange={(value) => handleFormChange("cabType", value)}
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
                    </>
                  )}
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

              {/* Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Images</Label>
                  <p className="text-sm text-gray-500">
                    {(formData.existingImages.length + formData.images.length)}/{MAX_IMAGES} images
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
                        {[...formData.existingImages, ...formData.images.map(img => URL.createObjectURL(img))].map((image, index) => (
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
                                  src={image}
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