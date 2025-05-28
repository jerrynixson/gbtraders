"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Search, Filter, Eye, MessageSquare, TrendingUp, Settings, Users, DollarSign, Car, Upload, Building2, MapPin, Phone, Mail, Globe, Clock, ChevronRight, Calendar, Share2, Bell, FileSpreadsheet, Database, RefreshCw, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDealerListings, deleteListing } from "@/lib/firebase"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"

interface Listing {
  id: string
  title: string
  price: number
  status: "active" | "pending" | "sold"
  views: number
  inquiries: number
  createdAt: string
  image: string
  make: string
  model: string
  year: number
  mileage: number
  fuel: string
  transmission: string
  description: string
  images: string[]
  updatedAt: string
}

interface DealerProfile {
  businessName: string
  contactEmail: string
  phoneNumber: string
  location: string
  website: string
  description: string
  businessHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  socialMedia: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
  }
  notifications: {
    email: boolean
    sms: boolean
    newInquiries: boolean
    listingUpdates: boolean
    marketing: boolean
  }
  logo: string
  coverImage: string
}

interface BulkUploadStatus {
  total: number
  processed: number
  success: number
  failed: number
  errors: string[]
}

interface VehicleAPIResponse {
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
    // ... other specifications
  }
}

interface FirebaseListing {
  id: string;
  title?: string;
  price?: number;
  status?: "active" | "pending" | "sold";
  views?: number;
  inquiries?: number;
  createdAt?: string;
  image?: string;
  make?: string;
  model?: string;
  year?: number;
  [key: string]: any; // Allow for additional fields from Firebase
}

const defaultProfile: DealerProfile = {
  businessName: "Premium Auto Dealership",
  contactEmail: "contact@premiumauto.com",
  phoneNumber: "+44 123 456 7890",
  location: "123 Auto Street, London, UK",
  website: "www.premiumauto.com",
  description: "Your trusted partner in premium automotive sales and service.",
  businessHours: {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "10:00 AM - 4:00 PM",
    sunday: "Closed"
  },
  socialMedia: {
    facebook: "premiumauto",
    twitter: "premiumauto",
    instagram: "premiumauto",
    linkedin: "premiumauto"
  },
  notifications: {
    email: true,
    sms: true,
    newInquiries: true,
    listingUpdates: true,
    marketing: false
  },
  logo: "/dealers/premium-auto-logo.png",
  coverImage: "/dealers/premium-auto-cover.jpg"
}

// Custom Badge component for status
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function DealerDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<DealerProfile>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bulkUploadStatus, setBulkUploadStatus] = useState<BulkUploadStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedAPI, setSelectedAPI] = useState<string>("")
  const [isFetchingVehicleData, setIsFetchingVehicleData] = useState(false)

  // Load listings from Firebase
  useEffect(() => {
    const loadListings = async () => {
      if (!user) {
        console.log("No authenticated user found")
        setIsLoading(false)
        return
      }

      try {
        const dealerListings = await getDealerListings(user.uid)
        console.log("Fetched listings from Firebase:", dealerListings)
        setListings(dealerListings)
      } catch (error) {
        console.error("Error loading listings:", error)
        toast.error("Failed to load listings")
      } finally {
        setIsLoading(false)
      }
    }

    loadListings()
  }, [user])

  const handleAddListing = () => {
    router.push("/dealer/dashboard/add-listing")
  }

  const handleEditListing = (id: string) => {
    router.push(`/dealer/dashboard/edit-listing/${id}`)
  }

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteListing(id)
      setListings(listings.filter(listing => listing.id !== id))
      toast.success("Listing deleted successfully")
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast.error("Failed to delete listing")
    }
  }

  const handleProfileChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBusinessHoursChange = (day: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: value
      }
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement Firebase update
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

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
      // This is a placeholder for the actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success("File uploaded successfully")
    } catch (error) {
      toast.error("Failed to process file")
      console.error("Error processing file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const fetchVehicleData = async (vin: string) => {
    setIsFetchingVehicleData(true)
    try {
      // TODO: Implement vehicle API integration
      // This is a placeholder for the actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Vehicle data fetched successfully")
    } catch (error) {
      toast.error("Failed to fetch vehicle data")
      console.error("Error fetching vehicle data:", error)
    } finally {
      setIsFetchingVehicleData(false)
    }
  }

  // Filter listings based on search query and status
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.model.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === "active").length,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
    totalInquiries: listings.reduce((sum, l) => sum + l.inquiries, 0),
    totalValue: listings.reduce((sum, l) => sum + l.price, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-semibold mb-4">No Listings Found</h2>
        <p className="text-gray-600 mb-6">Try adjusting your search filters or add a new listing to get started.</p>
        <Button onClick={handleAddListing}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Listing
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {profile.businessName}</h1>
          <p className="text-gray-600">Manage your dealership and listings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Listings</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalListings}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Active Listings</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.activeListings}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Views</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalViews}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Inquiries</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalInquiries}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
              <TabsTrigger value="listings" className="rounded-md data-[state=active]:bg-gray-100">
                Listings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-md data-[state=active]:bg-gray-100">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="rounded-md data-[state=active]:bg-gray-100">
                Inquiries
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-md data-[state=active]:bg-gray-100">
                Settings
              </TabsTrigger>
            </TabsList>
            <Button onClick={handleAddListing} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </Button>
          </div>

          <TabsContent value="listings">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by title, make, or model..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50/50 border-gray-200 focus:border-blue-200 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      className="bg-gray-50/50 hover:bg-gray-100"
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "active" ? "default" : "outline"}
                      onClick={() => setStatusFilter("active")}
                      className="bg-gray-50/50 hover:bg-gray-100"
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === "pending" ? "default" : "outline"}
                      onClick={() => setStatusFilter("pending")}
                      className="bg-gray-50/50 hover:bg-gray-100"
                    >
                      Pending
                    </Button>
                    <Button
                      variant={statusFilter === "sold" ? "default" : "outline"}
                      onClick={() => setStatusFilter("sold")}
                      className="bg-gray-50/50 hover:bg-gray-100"
                    >
                      Sold
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                          <p className="text-lg font-medium text-blue-600 mb-2">£{listing.price.toLocaleString()}</p>
                          <div className="flex items-center space-x-3">
                            <StatusBadge status={listing.status} />
                            <span className="text-sm text-gray-500 flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {listing.views}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {listing.inquiries}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditListing(listing.id)}
                          className="hover:bg-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteListing(listing.id)}
                          className="hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Views Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    Chart coming soon...
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Inquiries by Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-gray-500">
                    Chart coming soon...
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Inquiries</CardTitle>
                <CardDescription>
                  Manage and respond to customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                            <p className="text-sm text-gray-500">{listing.inquiries} inquiries</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Dealer Settings</CardTitle>
                    <CardDescription>
                      Manage your dealer account settings and profile
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gray-50 hover:bg-gray-100"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Profile Images */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Business Logo</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                            <img
                              src={profile.logo}
                              alt="Business Logo"
                              className="w-full h-full object-contain p-2"
                            />
                          </div>
                          {isEditing && (
                            <Button variant="outline" size="sm" className="bg-white">
                              <Upload className="w-4 h-4 mr-2" />
                              Change Logo
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                            <img
                              src={profile.coverImage}
                              alt="Cover Image"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isEditing && (
                            <Button variant="outline" size="sm" className="bg-white">
                              <Upload className="w-4 h-4 mr-2" />
                              Change Cover
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input
                          value={profile.businessName}
                          onChange={(e) => handleProfileChange("businessName", e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                          type="email"
                          value={profile.contactEmail}
                          onChange={(e) => handleProfileChange("contactEmail", e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          type="tel"
                          value={profile.phoneNumber}
                          onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                          type="url"
                          value={profile.website}
                          onChange={(e) => handleProfileChange("website", e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Location</Label>
                        <Input
                          value={profile.location}
                          onChange={(e) => handleProfileChange("location", e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Business Description</Label>
                        <Textarea
                          value={profile.description}
                          onChange={(e) => handleProfileChange("description", e.target.value)}
                          disabled={!isEditing}
                          className="bg-gray-50"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Business Hours */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(profile.businessHours).map(([day, hours]) => (
                        <div key={day} className="space-y-2">
                          <Label className="capitalize">{day}</Label>
                          <Input
                            value={hours}
                            onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                            disabled={!isEditing}
                            className="bg-gray-50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Social Media */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(profile.socialMedia).map(([platform, username]) => (
                        <div key={platform} className="space-y-2">
                          <Label className="capitalize">{platform}</Label>
                          <Input
                            value={username}
                            onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                            disabled={!isEditing}
                            className="bg-gray-50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <div className="space-y-4">
                      {Object.entries(profile.notifications).map(([type, enabled]) => (
                        <div key={type} className="flex items-center justify-between">
                          <Label className="capitalize">
                            {type.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            checked={enabled}
                            onCheckedChange={(checked) => handleNotificationChange(type, checked)}
                            disabled={!isEditing}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-4 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="bg-gray-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
} 