"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, RefreshCw, Upload, AlertCircle, FileSpreadsheet, ArrowLeft, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDropzone } from "react-dropzone"

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
  title: string
  price: string
  make: string
  model: string
  year: string
  mileage: string
  fuel: string
  transmission: string
  description: string
  images: File[]
}

interface BulkUploadStatus {
  total: number
  processed: number
  success: number
  failed: number
  errors: string[]
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

const MAX_IMAGES = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AddListing() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingVehicleData, setIsFetchingVehicleData] = useState(false)
  const [vin, setVin] = useState("")
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    price: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuel: "",
    transmission: "",
    description: "",
    images: []
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [bulkUploadStatus, setBulkUploadStatus] = useState<BulkUploadStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)")
      return
    }

    setIsUploading(true)
    setBulkUploadStatus({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      errors: []
    })

    try {
      // TODO: Implement Excel processing with SheetJS
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("File uploaded successfully")
    } catch (error) {
      toast.error("Failed to process file")
      console.error("Error processing file:", error)
    } finally {
      setIsUploading(false)
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
      // TODO: Implement Firebase upload
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Listing created successfully")
      router.push("/dealer/dashboard")
    } catch (error) {
      toast.error("Failed to create listing")
      console.error("Error creating listing:", error)
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

  const downloadTemplate = () => {
    // TODO: Implement actual template download
    toast.success("Template download started")
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
            <CardTitle>Add New Listing</CardTitle>
            <CardDescription>
              Create a new vehicle listing with automatic data fetching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="single" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Listing</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
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
                      ))}
                    </div>
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
                      {isLoading ? "Creating..." : "Create Listing"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="bulk">
                <div className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Upload Guidelines</AlertTitle>
                    <AlertDescription>
                      Make sure your Excel file follows the required format. Download the template for reference.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Database className="w-4 h-4 mr-2" />
                      View Documentation
                    </Button>
                  </div>

                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input {...getInputProps()} accept=".xlsx,.xls" />
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {isDragActive
                        ? "Drop the Excel file here"
                        : "Drag and drop your Excel file here, or click to select"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: .xlsx, .xls
                    </p>
                  </div>

                  {bulkUploadStatus && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{bulkUploadStatus.processed} / {bulkUploadStatus.total}</span>
                      </div>
                      <Progress value={(bulkUploadStatus.processed / bulkUploadStatus.total) * 100} />
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">{bulkUploadStatus.success} successful</span>
                        <span className="text-red-600">{bulkUploadStatus.failed} failed</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dealer/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? "Processing..." : "Process Upload"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
} 