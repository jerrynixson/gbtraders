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
import { VehicleType, Car as CarType, Van as VanType, Truck as TruckType } from "@/types/vehicles"
import { db, storage, auth } from "@/lib/firebase"
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuthState } from 'react-firebase-hooks/auth'

// OneAuto API interfaces
interface OneAutoApiResponse {
  success: boolean
  result?: {
    vehicle_identification: {
      ukvd_id: string
      ukvd_uvc: string
      vehicle_registration_mark: string
      vehicle_identification_number: string
      dvla_manufacturer_desc: string
      dvla_model_desc: string
      registration_date: string
      first_registration_date: string
      used_before_first_registration: boolean
      manufactured_year: number
      v5c_qty: number
      date_v5c_issued: string
      engine_number?: string
      prior_ni_vrm?: string
      dvla_body_desc: string
      dvla_fuel_desc: string
    }
    vehicle_status_details?: {
      is_non_eu_import: boolean
      is_imported: boolean
      is_exported: boolean
      exported_date?: string
      is_scrapped: boolean
      scrapped_date?: string
    }
    vehicle_excise_duty_details?: {
      co2_gkm: number
      dvla_co2_band: string
      "12_month_rfl_y1": number
      "6_month_rfl_y2_to_y6_premium": number
      "12_month_rfl_y2_to_y6_premium": number
      "6_month_rfl_y2_to_y6": number
      "12_month_rfl_y2_to_y6": number
    }
    colour_details?: {
      colour: string
      colour_changes_qty: number
      original_colour?: string
      last_colour?: string
      date_of_last_colour_change?: string
    }
    keeper_change_list?: Array<{
      number_previous_keepers: number
      date_of_last_keeper_change: string
    }>
    plate_change_list?: Array<{
      current_vehicle_registration_mark: string
      transfer_type: string
      date_of_receipt: string
      previous_vehicle_registration_mark?: string
      cherished_plate_transfer_date?: string
    }>
  }
  error?: string
}

interface VehicleData {
  make: string
  model: string
  year: number
  registrationNumber: string
  engineNumber?: string
  bodyType: string
  fuelType: string
  co2Emissions: number
  co2Band?: string
  color: string
  originalColor?: string
  v5cQty: number
  dateV5cIssued: string
  registrationDate: string
  firstRegistrationDate: string
  usedBeforeFirstRegistration: boolean
  vehicleIdentificationNumber?: string
  priorNiVrm?: string
  // Extended data for non-car vehicles
  isNonEuImport?: boolean
  isImported?: boolean
  isExported?: boolean
  exportedDate?: string
  isScrapped?: boolean
  scrappedDate?: string
  previousKeepers?: number
  lastKeeperChangeDate?: string
  colorChanges?: number
  lastColorChangeDate?: string
  taxDetails?: {
    month12RflY1: number
    month6RflY2ToY6Premium: number
    month12RflY2ToY6Premium: number
    month6RflY2ToY6: number
    month12RflY2ToY6: number
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
  vehicleIdentificationNumber: string
  engineNumber: string
  color: string
  originalColor: string
  range: string
  dateOfLastV5CIssued: string
  registrationDate: string
  firstRegistrationDate: string
  usedBeforeFirstRegistration: boolean
  v5cQty: string
  engineCapacity: string
  co2Emissions: string
  co2Band: string
  bodyType?: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon'
  doors?: string
  seats?: string
  cargoVolume?: string
  maxPayload?: string
  length?: string
  height?: string
  axles?: string
  cabType?: 'day' | 'sleeper'
  // Extended fields for non-car vehicles
  isNonEuImport: boolean
  isImported: boolean
  isExported: boolean
  exportedDate: string
  isScrapped: boolean
  scrappedDate: string
  previousKeepers: string
  lastKeeperChangeDate: string
  colorChanges: string
  lastColorChangeDate: string
  month12RflY1: string
  month6RflY2ToY6Premium: string
  month12RflY2ToY6Premium: string
  month6RflY2ToY6: string
  month12RflY2ToY6: string
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

const MAX_IMAGES = 8
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AddVehicleForm() {
  const router = useRouter()
  const [user, loading, error] = useAuthState(auth)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingVehicleData, setIsFetchingVehicleData] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState("")
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
    vehicleIdentificationNumber: "",
    engineNumber: "",
    color: "",
    originalColor: "",
    range: "0",
    dateOfLastV5CIssued: new Date().toISOString().split('T')[0],
    registrationDate: "",
    firstRegistrationDate: "",
    usedBeforeFirstRegistration: false,
    v5cQty: "1",
    engineCapacity: "",
    co2Emissions: "0",
    co2Band: "",
    isNonEuImport: false,
    isImported: false,
    isExported: false,
    exportedDate: "",
    isScrapped: false,
    scrappedDate: "",
    previousKeepers: "0",
    lastKeeperChangeDate: "",
    colorChanges: "0",
    lastColorChangeDate: "",
    month12RflY1: "0",
    month6RflY2ToY6Premium: "0",
    month12RflY2ToY6Premium: "0",
    month6RflY2ToY6: "0",
    month12RflY2ToY6: "0",
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

  const handleRegistrationSubmit = async () => {
    if (!registrationNumber.trim()) {
      toast.error("Please enter a registration number")
      return
    }
    setIsFetchingVehicleData(true)
    try {
      const apiKey = "76vnSKaRUrazD9cwlqSvm3eXqWvmJU7NaLow4hNI" // Using API key directly for now
      if (!apiKey) {
        throw new Error("OneAuto API key not configured")
      }

      console.log("Making API request with registration:", registrationNumber)
      console.log("API Key (first 10 chars):", apiKey.substring(0, 10))

      const response = await fetch(
        `https://api.oneautoapi.com/ukvehicledata/vehicledetailsfromvrm/v2?vehicle_registration_mark=${registrationNumber}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        }
      )

      console.log("API Response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error response:", errorText)
        throw new Error(`API request failed with status ${response.status}: ${errorText}`)
      }

      const data: OneAutoApiResponse = await response.json()
      console.log("API Response data:", data)

      if (!data.success || !data.result) {
        throw new Error(data.error || "Vehicle not found")
      }

      const apiResult = data.result
      
      const vehicleData: VehicleData = {
        make: apiResult.vehicle_identification.dvla_manufacturer_desc,
        model: apiResult.vehicle_identification.dvla_model_desc,
        year: apiResult.vehicle_identification.manufactured_year,
        registrationNumber: apiResult.vehicle_identification.vehicle_registration_mark,
        engineNumber: apiResult.vehicle_identification.engine_number || "",
        bodyType: apiResult.vehicle_identification.dvla_body_desc,
        fuelType: apiResult.vehicle_identification.dvla_fuel_desc,
        co2Emissions: apiResult.vehicle_excise_duty_details?.co2_gkm || 0,
        co2Band: apiResult.vehicle_excise_duty_details?.dvla_co2_band || "",
        color: apiResult.colour_details?.colour || "",
        originalColor: apiResult.colour_details?.original_colour || "",
        v5cQty: apiResult.vehicle_identification.v5c_qty,
        dateV5cIssued: apiResult.vehicle_identification.date_v5c_issued,
        registrationDate: apiResult.vehicle_identification.registration_date,
        firstRegistrationDate: apiResult.vehicle_identification.first_registration_date,
        usedBeforeFirstRegistration: apiResult.vehicle_identification.used_before_first_registration,
        vehicleIdentificationNumber: apiResult.vehicle_identification.vehicle_identification_number || "",
        priorNiVrm: apiResult.vehicle_identification.prior_ni_vrm || "",
        isNonEuImport: apiResult.vehicle_status_details?.is_non_eu_import || false,
        isImported: apiResult.vehicle_status_details?.is_imported || false,
        isExported: apiResult.vehicle_status_details?.is_exported || false,
        exportedDate: apiResult.vehicle_status_details?.exported_date || "",
        isScrapped: apiResult.vehicle_status_details?.is_scrapped || false,
        scrappedDate: apiResult.vehicle_status_details?.scrapped_date || "",
        previousKeepers: apiResult.keeper_change_list?.[0]?.number_previous_keepers || 0,
        lastKeeperChangeDate: apiResult.keeper_change_list?.[0]?.date_of_last_keeper_change || "",
        colorChanges: apiResult.colour_details?.colour_changes_qty || 0,
        lastColorChangeDate: apiResult.colour_details?.date_of_last_colour_change || "",
        taxDetails: apiResult.vehicle_excise_duty_details ? {
          month12RflY1: apiResult.vehicle_excise_duty_details["12_month_rfl_y1"],
          month6RflY2ToY6Premium: apiResult.vehicle_excise_duty_details["6_month_rfl_y2_to_y6_premium"],
          month12RflY2ToY6Premium: apiResult.vehicle_excise_duty_details["12_month_rfl_y2_to_y6_premium"],
          month6RflY2ToY6: apiResult.vehicle_excise_duty_details["6_month_rfl_y2_to_y6"],
          month12RflY2ToY6: apiResult.vehicle_excise_duty_details["12_month_rfl_y2_to_y6"]
        } : undefined
      }

      setVehicleData(vehicleData)
      
      // Map fuel type to our enum
      let mappedFuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' = 'petrol'
      const fuelTypeLower = vehicleData.fuelType.toLowerCase()
      if (fuelTypeLower.includes('diesel')) mappedFuelType = 'diesel'
      else if (fuelTypeLower.includes('electric')) mappedFuelType = 'electric'
      else if (fuelTypeLower.includes('hybrid')) mappedFuelType = 'hybrid'

      setFormData((prev: any) => ({
        ...prev,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year.toString(),
        registrationNumber: vehicleData.registrationNumber,
        vehicleIdentificationNumber: vehicleData.vehicleIdentificationNumber || "",
        engineNumber: vehicleData.engineNumber || "",
        fuelType: mappedFuelType,
        color: vehicleData.color,
        originalColor: vehicleData.originalColor || "",
        co2Emissions: vehicleData.co2Emissions.toString(),
        co2Band: vehicleData.co2Band || "",
        v5cQty: vehicleData.v5cQty.toString(),
        dateOfLastV5CIssued: vehicleData.dateV5cIssued,
        registrationDate: vehicleData.registrationDate,
        firstRegistrationDate: vehicleData.firstRegistrationDate,
        usedBeforeFirstRegistration: vehicleData.usedBeforeFirstRegistration,
        isNonEuImport: vehicleData.isNonEuImport || false,
        isImported: vehicleData.isImported || false,
        isExported: vehicleData.isExported || false,
        exportedDate: vehicleData.exportedDate || "",
        isScrapped: vehicleData.isScrapped || false,
        scrappedDate: vehicleData.scrappedDate || "",
        previousKeepers: (vehicleData.previousKeepers || 0).toString(),
        lastKeeperChangeDate: vehicleData.lastKeeperChangeDate || "",
        colorChanges: (vehicleData.colorChanges || 0).toString(),
        lastColorChangeDate: vehicleData.lastColorChangeDate || "",
        month12RflY1: (vehicleData.taxDetails?.month12RflY1 || 0).toString(),
        month6RflY2ToY6Premium: (vehicleData.taxDetails?.month6RflY2ToY6Premium || 0).toString(),
        month12RflY2ToY6Premium: (vehicleData.taxDetails?.month12RflY2ToY6Premium || 0).toString(),
        month6RflY2ToY6: (vehicleData.taxDetails?.month6RflY2ToY6 || 0).toString(),
        month12RflY2ToY6: (vehicleData.taxDetails?.month12RflY2ToY6 || 0).toString(),
      }))
      
      toast.success("Vehicle data fetched successfully")
    } catch (error) {
      toast.error(`Failed to fetch vehicle data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error("Error fetching vehicle data:", error)
    } finally {
      setIsFetchingVehicleData(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file: any) => {
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
    setFormData((prev: any) => ({ ...prev, images: [...prev.images, ...validFiles] }))
  }, [formData.images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }, maxSize: MAX_FILE_SIZE
  })

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({ ...prev, images: prev.images.filter((_: any, i: any) => i !== index) }))
  }

  const handleSubmit = async (e: any) => {
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
      // Get coordinates from pincode (optional - don't fail if this doesn't work)
      let coordinates = { latitude: "0", longitude: "0" }
      try {
        coordinates = await getCoordinatesFromPincode(
          formData.location.pincode,
          formData.location.city,
          formData.location.country
        )
      } catch (coordError) {
        console.warn("Could not get coordinates, using default values:", coordError)
        // Continue with default coordinates - this is not a critical error
      }
      
      // Update form data with coordinates
      setFormData((prev: any) => ({
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
        dateOfLastV5CIssued: new Date(formData.dateOfLastV5CIssued),
        registrationDate: formData.registrationDate,
        engineCapacity: formData.engineCapacity,
        co2Emissions: Number(formData.co2Emissions),
      }

      let vehicleToSubmit: CarType | VanType | TruckType

      switch (formData.type) {
        case 'car':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            id: vehicleId,
            type: 'car',
            bodyStyle: formData.bodyType as CarType['bodyStyle'],
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

  const handleFormChange = (field: keyof ListingFormData, value: string | VehicleType | boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev: any) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleLocationChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }))
    if (formErrors[`location.${field}`]) {
      setFormErrors((prev: any) => {
        const newErrors = { ...prev }
        delete newErrors[`location.${field}`]
        return newErrors
      })
    }
  }

  const handleCoordinatesChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
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
      setFormErrors((prev: any) => {
        const newErrors = { ...prev }
        delete newErrors[`location.coordinates.${field}`]
        return newErrors
      })
    }
  }

  const getCoordinatesFromPincode = async (pincode: string, city: string, country: string) => {
    try {
      // Check if we have a Google Maps API key
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.warn("Google Maps API key not configured")
        throw new Error('Google Maps API key not configured')
      }

      console.log("Making geocoding request for:", `${pincode} ${city} ${country}`)
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${pincode} ${city} ${country}`
        )}&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json();
      console.log("Geocoding API response:", data)
      
      if (data.status !== 'OK') {
        throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
      }
      
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log("Found coordinates:", { lat, lng })
        return { latitude: lat.toString(), longitude: lng.toString() };
      }
      throw new Error('No results found for the provided address');
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
            <Label>Registration Number</Label>
            <Input
              placeholder="Enter registration number to fetch vehicle details"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button
            type="button"
            onClick={handleRegistrationSubmit}
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
            <AlertDescription>
              {vehicleData.year} {vehicleData.make} {vehicleData.model} - {vehicleData.bodyType}
              <br />
              {vehicleData.fuelType} • {vehicleData.color} • {vehicleData.co2Emissions}g/km CO2
            </AlertDescription>
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
            <Label>Registration Date</Label>
            <Input
              type="date"
              value={formData.registrationDate}
              onChange={(e) => handleFormChange("registrationDate", e.target.value)}
              className={formErrors.registrationDate ? "border-red-500" : ""}
            />
            {formErrors.registrationDate && (
              <p className="text-sm text-red-500">{formErrors.registrationDate}</p>
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

      {/* Extended Vehicle Information - Show for non-car vehicles */}
      {formData.type !== 'car' && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Extended Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Identification Number</Label>
                <Input
                  value={formData.vehicleIdentificationNumber}
                  onChange={(e) => handleFormChange("vehicleIdentificationNumber", e.target.value)}
                  placeholder="Enter VIN"
                  className={formErrors.vehicleIdentificationNumber ? "border-red-500" : ""}
                />
                {formErrors.vehicleIdentificationNumber && (
                  <p className="text-sm text-red-500">{formErrors.vehicleIdentificationNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Engine Number</Label>
                <Input
                  value={formData.engineNumber}
                  onChange={(e) => handleFormChange("engineNumber", e.target.value)}
                  placeholder="Enter engine number"
                  className={formErrors.engineNumber ? "border-red-500" : ""}
                />
                {formErrors.engineNumber && (
                  <p className="text-sm text-red-500">{formErrors.engineNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Original Color</Label>
                <Input
                  value={formData.originalColor}
                  onChange={(e) => handleFormChange("originalColor", e.target.value)}
                  placeholder="Enter original color"
                  className={formErrors.originalColor ? "border-red-500" : ""}
                />
                {formErrors.originalColor && (
                  <p className="text-sm text-red-500">{formErrors.originalColor}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>CO2 Band</Label>
                <Input
                  value={formData.co2Band}
                  onChange={(e) => handleFormChange("co2Band", e.target.value)}
                  placeholder="Enter CO2 band"
                  className={formErrors.co2Band ? "border-red-500" : ""}
                />
                {formErrors.co2Band && (
                  <p className="text-sm text-red-500">{formErrors.co2Band}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Registration Date</Label>
                <Input
                  type="date"
                  value={formData.registrationDate}
                  onChange={(e) => handleFormChange("registrationDate", e.target.value)}
                  className={formErrors.registrationDate ? "border-red-500" : ""}
                />
                {formErrors.registrationDate && (
                  <p className="text-sm text-red-500">{formErrors.registrationDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>First Registration Date</Label>
                <Input
                  type="date"
                  value={formData.firstRegistrationDate}
                  onChange={(e) => handleFormChange("firstRegistrationDate", e.target.value)}
                  className={formErrors.firstRegistrationDate ? "border-red-500" : ""}
                />
                {formErrors.firstRegistrationDate && (
                  <p className="text-sm text-red-500">{formErrors.firstRegistrationDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>V5C Quantity</Label>
                <Input
                  type="number"
                  value={formData.v5cQty}
                  onChange={(e) => handleFormChange("v5cQty", e.target.value)}
                  placeholder="Enter V5C quantity"
                  className={formErrors.v5cQty ? "border-red-500" : ""}
                />
                {formErrors.v5cQty && (
                  <p className="text-sm text-red-500">{formErrors.v5cQty}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Previous Keepers</Label>
                <Input
                  type="number"
                  value={formData.previousKeepers}
                  onChange={(e) => handleFormChange("previousKeepers", e.target.value)}
                  placeholder="Enter number of previous keepers"
                  className={formErrors.previousKeepers ? "border-red-500" : ""}
                />
                {formErrors.previousKeepers && (
                  <p className="text-sm text-red-500">{formErrors.previousKeepers}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Color Changes</Label>
                <Input
                  type="number"
                  value={formData.colorChanges}
                  onChange={(e) => handleFormChange("colorChanges", e.target.value)}
                  placeholder="Enter number of color changes"
                  className={formErrors.colorChanges ? "border-red-500" : ""}
                />
                {formErrors.colorChanges && (
                  <p className="text-sm text-red-500">{formErrors.colorChanges}</p>
                )}
              </div>
            </div>

            {/* Tax Information */}
            <h4 className="text-md font-medium mt-6">Tax Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>12 Month RFL Y1 (£)</Label>
                <Input
                  type="number"
                  value={formData.month12RflY1}
                  onChange={(e) => handleFormChange("month12RflY1", e.target.value)}
                  placeholder="Enter 12 month RFL Y1"
                  className={formErrors.month12RflY1 ? "border-red-500" : ""}
                />
                {formErrors.month12RflY1 && (
                  <p className="text-sm text-red-500">{formErrors.month12RflY1}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>6 Month RFL Y2-Y6 Premium (£)</Label>
                <Input
                  type="number"
                  value={formData.month6RflY2ToY6Premium}
                  onChange={(e) => handleFormChange("month6RflY2ToY6Premium", e.target.value)}
                  placeholder="Enter 6 month RFL Y2-Y6 premium"
                  className={formErrors.month6RflY2ToY6Premium ? "border-red-500" : ""}
                />
                {formErrors.month6RflY2ToY6Premium && (
                  <p className="text-sm text-red-500">{formErrors.month6RflY2ToY6Premium}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>12 Month RFL Y2-Y6 Premium (£)</Label>
                <Input
                  type="number"
                  value={formData.month12RflY2ToY6Premium}
                  onChange={(e) => handleFormChange("month12RflY2ToY6Premium", e.target.value)}
                  placeholder="Enter 12 month RFL Y2-Y6 premium"
                  className={formErrors.month12RflY2ToY6Premium ? "border-red-500" : ""}
                />
                {formErrors.month12RflY2ToY6Premium && (
                  <p className="text-sm text-red-500">{formErrors.month12RflY2ToY6Premium}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>6 Month RFL Y2-Y6 (£)</Label>
                <Input
                  type="number"
                  value={formData.month6RflY2ToY6}
                  onChange={(e) => handleFormChange("month6RflY2ToY6", e.target.value)}
                  placeholder="Enter 6 month RFL Y2-Y6"
                  className={formErrors.month6RflY2ToY6 ? "border-red-500" : ""}
                />
                {formErrors.month6RflY2ToY6 && (
                  <p className="text-sm text-red-500">{formErrors.month6RflY2ToY6}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>12 Month RFL Y2-Y6 (£)</Label>
                <Input
                  type="number"
                  value={formData.month12RflY2ToY6}
                  onChange={(e) => handleFormChange("month12RflY2ToY6", e.target.value)}
                  placeholder="Enter 12 month RFL Y2-Y6"
                  className={formErrors.month12RflY2ToY6 ? "border-red-500" : ""}
                />
                {formErrors.month12RflY2ToY6 && (
                  <p className="text-sm text-red-500">{formErrors.month12RflY2ToY6}</p>
                )}
              </div>
            </div>

            {/* Status Information */}
            <h4 className="text-md font-medium mt-6">Status Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNonEuImport"
                  checked={formData.isNonEuImport}
                  onChange={(e) => handleFormChange("isNonEuImport", e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isNonEuImport">Non-EU Import</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isImported"
                  checked={formData.isImported}
                  onChange={(e) => handleFormChange("isImported", e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isImported">Imported</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isExported"
                  checked={formData.isExported}
                  onChange={(e) => handleFormChange("isExported", e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isExported">Exported</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isScrapped"
                  checked={formData.isScrapped}
                  onChange={(e) => handleFormChange("isScrapped", e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isScrapped">Scrapped</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usedBeforeFirstRegistration"
                  checked={formData.usedBeforeFirstRegistration}
                  onChange={(e) => handleFormChange("usedBeforeFirstRegistration", e.target.checked.toString())}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="usedBeforeFirstRegistration">Used Before First Registration</Label>
              </div>
            </div>
          </div>
          <Separator className="my-6" />
        </>
      )}

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