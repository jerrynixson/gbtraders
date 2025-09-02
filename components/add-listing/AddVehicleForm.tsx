"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, RefreshCw, AlertCircle, X, Image as ImageIcon, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { VehicleType, Car as CarType, Van as VanType, Truck as TruckType } from "@/types/vehicles"
import { db, storage, auth } from "@/lib/firebase"
import { doc, collection, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuthState } from 'react-firebase-hooks/auth'
import { useAuth } from '@/hooks/useAuth'
import { getTokenErrorMessage } from "@/lib/utils/tokenUtils"
import { imageCacheManager } from "@/lib/imageCache"
import { ImageUploadSection } from "./ImageUploadSection"
import { getDealerProfile } from "@/lib/dealer/profile"

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
  vehicleIdentificationNumber?: string
  priorNiVrm?: string
  // Extended data for non-car vehicles
  previousKeepers?: number
  lastKeeperChangeDate?: string
  colorChanges?: number
  lastColorChangeDate?: string
}

interface ListingFormData {
  type: VehicleType
  title: string
  price: string
  make: string
  model: string
  year: string
  mileage: string
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | ''
  transmission: 'manual' | 'automatic' | ''
  description: string
  imageUrls: string[] // Changed from images to imageUrls
  registrationNumber: string
  vehicleIdentificationNumber: string
  engineNumber: string
  color: string
  originalColor: string
  range: string
  dateOfLastV5CIssued: string
  registrationDate: string
  firstRegistrationDate: string
  v5cQty: string
  engineCapacity: string
  co2Emissions: string
  co2Band: string
  bodyType?: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon' | ''
  doors?: string
  seats?: string
  cargoVolume?: string
  maxPayload?: string
  length?: string
  height?: string
  axles?: string
  cabType?: 'day' | 'sleeper' | ''
  // Extended fields for non-car vehicles
  previousKeepers: string
  lastKeeperChangeDate: string
  colorChanges: string
  lastColorChangeDate: string
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

const MAX_IMAGES = 30
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

interface AddVehicleFormProps {
  vehicleId?: string // Optional vehicle ID for editing
  isEditMode?: boolean // Flag to indicate if we're editing
}

export default function AddVehicleForm({ vehicleId, isEditMode = false }: AddVehicleFormProps) {
  const router = useRouter()
  const [user, loading, error] = useAuthState(auth)
  const { user: authUser, getUserProfile } = useAuth() // This includes role information and profile function
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isFetchingVehicleData, setIsFetchingVehicleData] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null)
  const [canCreateNewListing, setCanCreateNewListing] = useState(false)
  const [tokenCheckError, setTokenCheckError] = useState<string>("")
  const [formData, setFormData] = useState<ListingFormData>({
    type: 'car',
    title: "",
    price: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    description: "",
    imageUrls: [], // Changed from images
    registrationNumber: "",
    vehicleIdentificationNumber: "",
    engineNumber: "",
    color: "",
    originalColor: "",
    range: "0",
    dateOfLastV5CIssued: new Date().toISOString().split('T')[0],
    registrationDate: "",
    firstRegistrationDate: "",
    v5cQty: "1",
    engineCapacity: "",
    co2Emissions: "0",
    co2Band: "",
    bodyType: "",
    doors: "",
    seats: "",
    cargoVolume: "",
    maxPayload: "",
    length: "",
    height: "",
    axles: "",
    cabType: "",
    previousKeepers: "0",
    lastKeeperChangeDate: "",
    colorChanges: "0",
    lastColorChangeDate: ""
  })
  const [initialImages, setInitialImages] = useState<string[]>([]) // Track initial images for cache initialization
  const [currentVehicleId, setCurrentVehicleId] = useState<string>("")
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Get user role from auth context
  const userRole = authUser?.role || 'user'

  // Generate vehicle ID when component mounts
  useEffect(() => {
    if (isEditMode && vehicleId) {
      setCurrentVehicleId(vehicleId);
    } else {
      // Generate a new ID for new vehicles
      const newVehicleId = doc(collection(db, "vehicles")).id;
      setCurrentVehicleId(newVehicleId);
    }
  }, [isEditMode, vehicleId]);

  // Check token availability when component mounts
  useEffect(() => {
    const checkTokenAvailability = async () => {
      if (!user) return

      try {
        // Use the admin API to check plan information
        const response = await fetch(`/api/plan-info?userType=${userRole}`, {
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch plan information');
        }

        const data = await response.json();
        
        if (data.success && data.planInfo) {
          const planInfo = data.planInfo;
          
          // Check if plan is active and has available tokens
          const now = new Date();
          const planEndDate = new Date(planInfo.planEndDate);
          const planExpired = planEndDate < now;
          const hasActivePlan = !planExpired && !!planInfo.planName;
          const availableTokens = Math.max(0, planInfo.totalTokens - planInfo.usedTokens);
          const hasAvailableTokens = hasActivePlan && availableTokens > 0;

          setCanCreateNewListing(hasAvailableTokens);
          
          if (!hasAvailableTokens) {
            let reason = 'no_plan';
            if (planExpired) reason = 'plan_expired';
            else if (hasActivePlan && availableTokens === 0) reason = 'no_tokens';
            
            const errorMessage = getTokenErrorMessage(reason);
            setTokenCheckError(errorMessage);
          } else {
            setTokenCheckError("");
          }
        } else {
          setCanCreateNewListing(false);
          setTokenCheckError('You need an active plan to create listings. Please choose a plan to get started.');
        }
      } catch (error) {
        console.error('Error checking token availability:', error)
        setTokenCheckError('Unable to verify listing permissions')
        setCanCreateNewListing(false)
      }
    }

    if (!loading) {
      checkTokenAvailability()
    }
  }, [user, loading])

  // Load existing vehicle data when in edit mode
  useEffect(() => {
    const loadVehicleData = async () => {
      if (!isEditMode || !vehicleId || !user) return

      try {
        const vehicleRef = doc(db, "vehicles", vehicleId)
        const vehicleDoc = await getDoc(vehicleRef)

        if (!vehicleDoc.exists()) {
          toast.error("Vehicle not found")
          router.push("/dashboard")
          return
        }

        const vehicleData = vehicleDoc.data()
        console.log("Loading vehicle data for editing:", vehicleData)

        // Helper function to format dates for HTML date inputs (yyyy-MM-dd)
        const formatDateForInput = (dateValue: any): string => {
          if (!dateValue) return ""
          
          try {
            let date: Date
            
            // Handle Firestore Timestamp objects
            if (dateValue && typeof dateValue.toDate === 'function') {
              date = dateValue.toDate()
            } else if (typeof dateValue === 'string') {
              date = new Date(dateValue)
            } else if (dateValue instanceof Date) {
              date = dateValue
            } else {
              console.warn("Unknown date format:", dateValue)
              return ""
            }
            
            if (isNaN(date.getTime())) {
              console.warn("Invalid date:", dateValue)
              return ""
            }
            
            // Format as yyyy-MM-dd
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          } catch (error) {
            console.warn("Error formatting date:", dateValue, error)
            return ""
          }
        }

        // Map the vehicle data to form data
        setFormData({
          type: vehicleData.type || 'car',
          title: vehicleData.title || "",
          price: vehicleData.price?.toString() || "",
          make: vehicleData.make || "",
          model: vehicleData.model || "",
          year: vehicleData.year?.toString() || "",
          mileage: vehicleData.mileage?.toString() || "",
          fuelType: vehicleData.fuelType || "",
          transmission: vehicleData.transmission || "",
          description: vehicleData.description || "",
          imageUrls: [], // New images will be added here
          registrationNumber: vehicleData.registrationNumber || "",
          vehicleIdentificationNumber: vehicleData.vehicleIdentificationNumber || "",
          engineNumber: vehicleData.engineNumber || "",
          color: vehicleData.color || "",
          originalColor: vehicleData.originalColor || "",
          range: vehicleData.range?.toString() || "0",
          dateOfLastV5CIssued: formatDateForInput(vehicleData.dateOfLastV5CIssued) || new Date().toISOString().split('T')[0],
          registrationDate: formatDateForInput(vehicleData.registrationDate),
          firstRegistrationDate: formatDateForInput(vehicleData.firstRegistrationDate),
          v5cQty: vehicleData.v5cQty?.toString() || "1",
          engineCapacity: vehicleData.engineCapacity || "",
          co2Emissions: vehicleData.co2Emissions?.toString() || "0",
          co2Band: vehicleData.co2Band || "",
          bodyType: vehicleData.bodyStyle || "",
          doors: vehicleData.doors?.toString() || "",
          seats: vehicleData.seats?.toString() || "",
          cargoVolume: vehicleData.cargoVolume?.toString() || "",
          maxPayload: vehicleData.maxPayload?.toString() || "",
          length: vehicleData.length?.toString() || "",
          height: vehicleData.height?.toString() || "",
          axles: vehicleData.axles?.toString() || "",
          cabType: vehicleData.cabType || "",
          previousKeepers: vehicleData.previousKeepers?.toString() || "0",
          lastKeeperChangeDate: formatDateForInput(vehicleData.lastKeeperChangeDate),
          colorChanges: vehicleData.colorChanges?.toString() || "0",
          lastColorChangeDate: formatDateForInput(vehicleData.lastColorChangeDate)
        })

        // Set existing images
        setInitialImages(vehicleData.images || [])

        toast.success("Vehicle data loaded successfully")
      } catch (error) {
        console.error("Error loading vehicle data:", error)
        toast.error("Failed to load vehicle data")
        router.push("/dashboard")
      }
    }

    if (isEditMode && vehicleId && user && !loading) {
      loadVehicleData()
    }
  }, [isEditMode, vehicleId, user, loading, router])

  // Cleanup cache when component unmounts
  useEffect(() => {
    return () => {
      if (currentVehicleId && !isEditMode) {
        // Clear cache for new listings on unmount to prevent orphaned images
        imageCacheManager.clearCache(currentVehicleId)
      }
    }
  }, [currentVehicleId, isEditMode])

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
    if (!isEditMode && formData.imageUrls.length === 0) errors.images = "At least one image is required"
    if (!formData.registrationNumber.trim()) errors.registrationNumber = "Registration number is required"
    if (!formData.color.trim()) errors.color = "Color is required"
    if (!formData.engineCapacity.trim()) errors.engineCapacity = "Engine capacity is required"

    // Character limit validation
    if (formData.title.length > 20) {
      errors.title = "Title must be 20 characters or less"
    }
    if (formData.description.length > 500) {
      errors.description = "Description must be 500 characters or less"
    }

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
        vehicleIdentificationNumber: apiResult.vehicle_identification.vehicle_identification_number || "",
        priorNiVrm: apiResult.vehicle_identification.prior_ni_vrm || "",
        previousKeepers: apiResult.keeper_change_list?.[0]?.number_previous_keepers || 0,
        lastKeeperChangeDate: apiResult.keeper_change_list?.[0]?.date_of_last_keeper_change || "",
        colorChanges: apiResult.colour_details?.colour_changes_qty || 0,
        lastColorChangeDate: apiResult.colour_details?.date_of_last_colour_change || ""
      }

      setVehicleData(vehicleData)
      
      // Map fuel type to our enum
      let mappedFuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | '' = 'petrol'
      const fuelTypeLower = vehicleData.fuelType.toLowerCase()
      if (fuelTypeLower.includes('diesel')) mappedFuelType = 'diesel'
      else if (fuelTypeLower.includes('electric')) mappedFuelType = 'electric'
      else if (fuelTypeLower.includes('hybrid')) mappedFuelType = 'hybrid'

      // Helper function to format dates for HTML date inputs (yyyy-MM-dd)
      const formatDateForInput = (dateString: string): string => {
        if (!dateString) return ""
        
        try {
          // Try to parse the date and format it as yyyy-MM-dd
          const date = new Date(dateString)
          if (isNaN(date.getTime())) {
            console.warn("Invalid date:", dateString)
            return ""
          }
          
          // Format as yyyy-MM-dd
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        } catch (error) {
          console.warn("Error formatting date:", dateString, error)
          return ""
        }
      }

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
        bodyType: vehicleData.bodyType || "",
        v5cQty: vehicleData.v5cQty.toString(),
        dateOfLastV5CIssued: formatDateForInput(vehicleData.dateV5cIssued),
        registrationDate: formatDateForInput(vehicleData.registrationDate),
        firstRegistrationDate: formatDateForInput(vehicleData.firstRegistrationDate),
        previousKeepers: (vehicleData.previousKeepers || 0).toString(),
        lastKeeperChangeDate: formatDateForInput(vehicleData.lastKeeperChangeDate || ""),
        colorChanges: (vehicleData.colorChanges || 0).toString(),
        lastColorChangeDate: formatDateForInput(vehicleData.lastColorChangeDate || "")
      }))
      
      toast.success("Vehicle data fetched successfully")
    } catch (error) {
      toast.error(`Failed to fetch vehicle data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error("Error fetching vehicle data:", error)
    } finally {
      setIsFetchingVehicleData(false)
    }
  }

  // Image handling is now managed by ImageUploadSection and cache
  const handleImagesChange = useCallback((imageUrls: string[]) => {
    setFormData(prev => ({ ...prev, imageUrls }))
  }, [])

  // Handle image upload state changes
  const handleUploadStateChange = useCallback((isUploading: boolean) => {
    setIsUploadingImages(isUploading)
  }, [])

  // These handlers are no longer needed but kept for compatibility
  const handleUploadComplete = (urls: string[]) => {
    // No longer needed - handled by cache
  }

  const handleUploadedImageRemove = (url: string) => {
    // No longer needed - handled by cache
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to create a listing")
      return
    }

    // Prevent submission while images are uploading
    if (isUploadingImages) {
      toast.error("Please wait for images to finish uploading before submitting")
      return
    }

    // Skip token availability check for edit mode
    if (!isEditMode) {
      // Check token availability before proceeding (only for new listings)
      if (!canCreateNewListing) {
        toast.error(tokenCheckError || "Cannot create listing. Please check your plan.")
        return
      }

      // Double-check token availability at submission time
      const response = await fetch(`/api/plan-info?userType=${userRole}`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plan information');
      }

      const planData = await response.json();
      
      if (!planData.success || !planData.planInfo) {
        toast.error('You need an active plan to create listings. Please choose a plan to get started.');
        setIsLoading(false);
        return;
      }

      const planInfo = planData.planInfo;
      const now = new Date();
      const planEndDate = new Date(planInfo.planEndDate);
      const planExpired = planEndDate < now;
      const hasActivePlan = !planExpired && !!planInfo.planName;
      const availableTokens = Math.max(0, planInfo.totalTokens - planInfo.usedTokens);
      const hasAvailableTokens = hasActivePlan && availableTokens > 0;

      if (!hasAvailableTokens) {
        let reason = 'no_plan';
        if (planExpired) reason = 'plan_expired';
        else if (hasActivePlan && availableTokens === 0) reason = 'no_tokens';
        
        toast.error(getTokenErrorMessage(reason));
        setIsLoading(false);
        return;
      }
    }

    if (!validateForm()) {
      toast.error("Please fix the form errors")
      return
    }
    setIsLoading(true)

    try {
      // Get location information based on user role
      let vehicleLocation = null;
      try {
        if (userRole === 'dealer') {
          // For dealers, get location from dealer profile
          const dealerProfile = await getDealerProfile(user.uid);
          if (dealerProfile && dealerProfile.location) {
            vehicleLocation = {
              addressLines: dealerProfile.location.addressLines,
              lat: dealerProfile.location.lat,
              long: dealerProfile.location.long
            };
            console.log("🏢 Using dealer location:", vehicleLocation);
          }
        } else {
          // For regular users, get location from user profile
          const userProfile = await getUserProfile();
          if (userProfile && userProfile.location) {
            vehicleLocation = {
              addressLines: userProfile.location.addressLines,
              lat: userProfile.location.lat,
              long: userProfile.location.long
            };
            console.log("👤 Using user location:", vehicleLocation);
          }
        }

        // If no location found, show error and prevent creation
        if (!vehicleLocation) {
          const profileLocation = userRole === 'dealer' ? 'dashboard' : 'profile';
          toast.error(`Location couldn't be obtained. Please update your profile in ${profileLocation} before creating a listing.`);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("❌ Error fetching location from profile:", error);
        const profileLocation = userRole === 'dealer' ? 'dashboard' : 'profile';
        toast.error(`Location couldn't be obtained. Please update your profile in ${profileLocation} before creating a listing.`);
        setIsLoading(false);
        return;
      }

      // Use existing vehicle ID for edit mode, or the pre-generated one for create mode
      const vehicleIdToUse = currentVehicleId;

      // Get final image URLs from cache and save
      const finalImageUrls = await imageCacheManager.finalSave(vehicleIdToUse);

      const vehicleDataFromForm = {
        title: formData.title,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        description: formData.description,
        registrationNumber: formData.registrationNumber,
        vehicleIdentificationNumber: formData.vehicleIdentificationNumber,
        engineNumber: formData.engineNumber,
        color: formData.color,
        originalColor: formData.originalColor,
        range: Number(formData.range),
        dateOfLastV5CIssued: formData.dateOfLastV5CIssued ? new Date(formData.dateOfLastV5CIssued) : new Date(),
        registrationDate: formData.registrationDate,
        firstRegistrationDate: formData.firstRegistrationDate,
        v5cQty: Number(formData.v5cQty),
        engineCapacity: formData.engineCapacity,
        co2Emissions: Number(formData.co2Emissions),
        co2Band: formData.co2Band,
        previousKeepers: Number(formData.previousKeepers),
        lastKeeperChangeDate: formData.lastKeeperChangeDate,
        colorChanges: Number(formData.colorChanges),
        lastColorChangeDate: formData.lastColorChangeDate,
      }

      let vehicleToSubmit: CarType | VanType | TruckType

      switch (formData.type) {
        case 'car':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            id: vehicleIdToUse,
            type: 'car',
            bodyStyle: formData.bodyType as CarType['bodyStyle'],
            doors: Number(formData.doors),
            seats: Number(formData.seats),
            features: [],
            location: {
              addressLines: vehicleLocation.addressLines,
              coordinates: {
                latitude: vehicleLocation.lat,
                longitude: vehicleLocation.long
              }
            },
            images: finalImageUrls,
            createdAt: isEditMode ? undefined : new Date(), // Don't overwrite createdAt when editing
            updatedAt: new Date(),
            status: 'available' as const,
            dealerUid: user?.uid || "N/A"
          } as unknown as CarType
          break
        case 'van':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            id: vehicleIdToUse,
            type: 'van',
            cargoVolume: Number(formData.cargoVolume!),
            maxPayload: Number(formData.maxPayload!),
            length: Number(formData.length!),
            height: Number(formData.height!),
            features: [],
            location: {
              addressLines: vehicleLocation.addressLines,
              coordinates: {
                latitude: vehicleLocation.lat,
                longitude: vehicleLocation.long
              }
            },
            images: finalImageUrls,
            createdAt: isEditMode ? undefined : new Date(),
            updatedAt: new Date(),
            status: 'available' as const,
            dealerUid: user?.uid || "N/A"
          } as unknown as VanType
          break
        case 'truck':
          vehicleToSubmit = {
            ...vehicleDataFromForm,
            id: vehicleIdToUse,
            type: 'truck',
            maxPayload: Number(formData.maxPayload!),
            axles: Number(formData.axles!),
            cabType: formData.cabType as TruckType['cabType'],
            features: [],
            location: {
              addressLines: vehicleLocation.addressLines,
              coordinates: {
                latitude: vehicleLocation.lat,
                longitude: vehicleLocation.long
              }
            },
            images: finalImageUrls,
            createdAt: isEditMode ? undefined : new Date(),
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

      console.log(isEditMode ? "Updating vehicle data in Firestore:" : "Creating vehicle data in Firestore:", vehicleToSubmit)
      
      if (isEditMode) {
        // Update existing vehicle - preserve existing token data
        const { createdAt, ...updateData } = vehicleToSubmit
        await updateDoc(doc(db, "vehicles", vehicleIdToUse), updateData)
        toast.success("Vehicle updated successfully")
      } else {
        // Create new vehicle with token data
        const vehicleWithTokenData = {
          ...vehicleToSubmit,
          tokenStatus: 'inactive', // Default to inactive until token is activated
          tokenActivatedDate: null,
          tokenExpiryDate: null
        }

        // Save the vehicle to Firestore
        await setDoc(doc(db, "vehicles", vehicleIdToUse), vehicleWithTokenData)

        // Activate the token for this vehicle using the API
        const activateResponse = await fetch('/api/activate-vehicle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await user.getIdToken()}`
          },
          body: JSON.stringify({
            vehicleId: vehicleIdToUse,
            action: 'activate'
          })
        });

        const tokenResult = await activateResponse.json();
        
        if (tokenResult.success) {
          toast.success("Listing created and activated successfully")
        } else {
          toast.warning(`Listing created but token activation failed: ${tokenResult.error}`)
        }
      }

      router.push("/dashboard")
    } catch (error) {
      console.error(isEditMode ? "Error updating listing:" : "Error creating listing:", error)
      let errorMessage = isEditMode ? "Failed to update listing." : "Failed to create listing."
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Token Availability Alert */}
      {loading ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Checking your plan and token availability...</AlertDescription>
        </Alert>
      ) : !canCreateNewListing ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Cannot Create Listing</AlertTitle>
          <AlertDescription className="text-red-700">
            {tokenCheckError}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto ml-2 text-red-600 underline"
              onClick={() => router.push('/payment-plans')}
            >
              Upgrade Plan
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            ✓ You can create new listings. This listing will use 1 token when activated.
          </AlertDescription>
        </Alert>
      )}

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
            <Select value={formData.fuelType} onValueChange={(value) => handleFormChange("fuelType", value as 'petrol' | 'diesel' | 'electric' | 'hybrid' | '')}>
              <SelectTrigger className={formErrors.fuelType ? "border-red-500" : ""}><SelectValue placeholder="Select fuel type" /></SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map(type => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
              </SelectContent>
            </Select>
            {formErrors.fuelType && <p className="text-sm text-red-500">{formErrors.fuelType}</p>}
          </div>
          <div className="space-y-2">
            <Label>Transmission</Label>
            <Select value={formData.transmission} onValueChange={(value) => handleFormChange("transmission", value as 'manual' | 'automatic' | '')}>
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
          </div>
          <Separator className="my-6" />
        </>
      )}

      {/* Type-specific Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Type-specific Details</h3>
        {formData.type === 'car' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Body Type</Label>
              <Select
                value={formData.bodyType}
                onValueChange={(value) => handleFormChange("bodyType", value as 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon' | '')}
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
                onValueChange={(value) => handleFormChange("cabType", value as 'day' | 'sleeper' | '')}
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
      <ImageUploadSection
        onImagesChange={handleImagesChange}
        onUploadStateChange={handleUploadStateChange}
        maxImages={MAX_IMAGES}
        maxFileSize={MAX_FILE_SIZE}
        vehicleId={currentVehicleId}
        initialImages={initialImages}
        isEditMode={isEditMode}
      />
      {formErrors.images && <p className="text-sm text-red-500">{formErrors.images}</p>}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={isLoading || isUploadingImages || (!canCreateNewListing && !isEditMode)} 
          className={`bg-blue-600 hover:bg-blue-700 disabled:opacity-50 ${isUploadingImages ? 'cursor-not-allowed' : ''}`}
        >
          {isUploadingImages 
            ? "Uploading Images..."
            : isLoading 
            ? (isEditMode ? "Updating..." : "Creating...") 
            : isEditMode 
            ? "Update Listing" 
            : (!canCreateNewListing ? "Cannot Create Listing" : "Create Listing")
          }
        </Button>
      </div>
    </form>
  )
} 