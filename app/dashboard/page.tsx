"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Search, Filter, Eye, MessageSquare, TrendingUp, Settings, Users, DollarSign, Car, Upload, Building2, MapPin, Phone, Mail, Globe, Clock, ChevronRight, Calendar, Share2, Bell, FileSpreadsheet, Database, RefreshCw, AlertCircle, CreditCard } from "lucide-react"
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
import { DealerProfileSection } from "@/components/dealer/profile"

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
    router.push("/dashboard/add-listing")
  }

  const handleEditListing = (id: string) => {
    router.push(`/dashboard/edit-listing/${id}`)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome back, Dealer</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your dealership and listings</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm w-full sm:w-auto">
              <TabsTrigger value="listings" className="rounded-md data-[state=active]:bg-gray-100 w-full sm:w-auto">Listings</TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-md data-[state=active]:bg-gray-100 w-full sm:w-auto">Analytics</TabsTrigger>
              <TabsTrigger value="inquiries" className="rounded-md data-[state=active]:bg-gray-100 w-full sm:w-auto">Inquiries</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-md data-[state=active]:bg-gray-100 w-full sm:w-auto">Profile</TabsTrigger>
            </TabsList>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => router.push("/payment-plans")}
                className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Plans
              </Button>
              <Button onClick={handleAddListing} className="bg-blue-600 hover:bg-blue-700 shadow-sm w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>
            </div>
          </div>

          <TabsContent value="listings">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by title, make, or model..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50/50 border-gray-200 focus:border-blue-200 focus:ring-blue-200 text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      className={`flex-1 sm:flex-none ${statusFilter === "all" ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "active" ? "default" : "outline"}
                      onClick={() => setStatusFilter("active")}
                      className={`flex-1 sm:flex-none ${statusFilter === "active" ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === "pending" ? "default" : "outline"}
                      onClick={() => setStatusFilter("pending")}
                      className={`flex-1 sm:flex-none ${statusFilter === "pending" ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={statusFilter === "sold" ? "default" : "outline"}
                      onClick={() => setStatusFilter("sold")}
                      className={`flex-1 sm:flex-none ${statusFilter === "sold" ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      Sold
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  // Empty state within the listings tab
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Listings Yet</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Get started by adding your first vehicle listing. Showcase your inventory to potential buyers.
                    </p>
                    <Button onClick={handleAddListing} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Listing
                    </Button>
                  </div>
                ) : filteredListings.length === 0 ? (
                  // No results from search/filter
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  // Listings grid
                  <div className="space-y-4">
                    {filteredListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm gap-3 sm:gap-0"
                      >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full">
                          <div className="w-full sm:w-24 h-40 sm:h-24 relative rounded-lg overflow-hidden mb-2 sm:mb-0">
                            <img
                              src={listing.image}
                              alt={listing.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 w-full text-center sm:text-left">
                            <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                            <p className="text-lg font-medium text-blue-600 mb-2">£{listing.price.toLocaleString()}</p>
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
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
                        <div className="flex gap-2 justify-center sm:justify-end w-full sm:w-auto">
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
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
                {listings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <MessageSquare className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Inquiries Yet</h3>
                    <p className="text-gray-600 text-center mb-6 max-w-md">
                      Once you add listings, customer inquiries will appear here for you to manage.
                    </p>
                    <Button onClick={handleAddListing} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full">
                        <div className="w-full sm:w-16 h-32 sm:h-16 relative rounded-lg overflow-hidden mb-2 sm:mb-0">
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 w-full text-center sm:text-left">
                          <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                          <p className="text-sm text-gray-500">{listing.inquiries} inquiries</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 w-full sm:w-auto mt-2 sm:mt-0">
                          View Details
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <DealerProfileSection />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
} 