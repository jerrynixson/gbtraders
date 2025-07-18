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
import { deleteListing } from "@/lib/firebase"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { auth } from "@/lib/firebase"
import { DealerProfileSection } from "@/components/dealer/profile"
import { PlanInfoSection } from "@/components/dashboard/PlanInfoSection"
import { TokenizedVehicleCard } from "@/components/dashboard/TokenizedVehicleCard"
import { getDealerProfile } from "@/lib/dealer/profile"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserPlanInfo {
  planName: string
  planPrice: number
  totalTokens: number
  usedTokens: number
  planStartDate: Date
  planEndDate: Date
  userId: string
}

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
  const [allVehicles, setAllVehicles] = useState<any[]>([])
  const [activeVehicles, setActiveVehicles] = useState<any[]>([])
  const [inactiveVehicles, setInactiveVehicles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tokenFilter, setTokenFilter] = useState<string>("all") // all, active, inactive
  const [isLoading, setIsLoading] = useState(true)
  const [planInfo, setPlanInfo] = useState<UserPlanInfo | null>(null)
  const [bulkUploadStatus, setBulkUploadStatus] = useState<BulkUploadStatus | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedAPI, setSelectedAPI] = useState<string>("")
  const [isFetchingVehicleData, setIsFetchingVehicleData] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);
  const [dealerName, setDealerName] = useState<string | null>(null);
  const [isDealerNameLoading, setIsDealerNameLoading] = useState(false);

  // Load all vehicle data and plan info
  useEffect(() => {
    if (user) {
      loadDashboardData()
      fetchDealerName()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) {
      console.log("No authenticated user found")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // Get ID token - try user method first, then fallback to auth.currentUser
      let token;
      try {
        if (user.getIdToken) {
          token = await user.getIdToken();
        } else {
          // Fallback: get token from auth.currentUser
          const currentUser = auth.currentUser;
          if (currentUser) {
            token = await currentUser.getIdToken();
          } else {
            throw new Error('No authenticated user found');
          }
        }
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        toast.error('Authentication error - please try logging in again');
        return;
      }

      // Load plan information using API
      const planResponse = await fetch(`/api/plan-info?userType=dealer`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (planResponse.ok) {
        const planData = await planResponse.json();
        // Convert date strings back to Date objects
        const planInfo = planData.planInfo ? {
          ...planData.planInfo,
          planStartDate: planData.planInfo.planStartDate ? new Date(planData.planInfo.planStartDate) : undefined,
          planEndDate: planData.planInfo.planEndDate ? new Date(planData.planInfo.planEndDate) : undefined,
          lastPaymentDate: planData.planInfo.lastPaymentDate ? new Date(planData.planInfo.lastPaymentDate) : undefined,
          purchaseHistory: (planData.planInfo.purchaseHistory || []).map((record: any) => ({
            ...record,
            purchaseDate: record.purchaseDate ? new Date(record.purchaseDate) : undefined
          }))
        } : null;
        setPlanInfo(planInfo);
      }

      // Load vehicle data using API
      const vehicleResponse = await fetch('/api/dealer-vehicles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (vehicleResponse.ok) {
        const vehicleData = await vehicleResponse.json();
        // Convert date strings back to Date objects
        const processVehicles = (vehicles: any[]) => vehicles.map(vehicle => ({
          ...vehicle,
          createdAt: vehicle.createdAt ? new Date(vehicle.createdAt) : undefined,
          updatedAt: vehicle.updatedAt ? new Date(vehicle.updatedAt) : undefined,
          tokenActivatedDate: vehicle.tokenActivatedDate ? new Date(vehicle.tokenActivatedDate) : undefined,
          tokenExpiryDate: vehicle.tokenExpiryDate ? new Date(vehicle.tokenExpiryDate) : undefined,
          tokenDeactivatedDate: vehicle.tokenDeactivatedDate ? new Date(vehicle.tokenDeactivatedDate) : undefined
        }));

        const activeVehicles = processVehicles(vehicleData.data.activeVehicles);
        const inactiveVehicles = processVehicles(vehicleData.data.inactiveVehicles);
        
        setActiveVehicles(activeVehicles);
        setInactiveVehicles(inactiveVehicles);
        setAllVehicles([...activeVehicles, ...inactiveVehicles]);
      }

      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDealerName = async () => {
    if (!user) return;
    setIsDealerNameLoading(true);
    try {
      // 1. Try dealer profile business name
      const profile = await getDealerProfile(user.uid);
      if (profile && profile.businessName) {
        setDealerName(profile.businessName);
        setIsDealerNameLoading(false);
        return;
      }
      // 2. Try user profile (Firestore) firstName + lastName
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.firstName || userData.lastName) {
          setDealerName(`${userData.firstName || ""} ${userData.lastName || ""}`.trim());
          setIsDealerNameLoading(false);
          return;
        }
      }
      // 3. Fallback to user object displayName or email
      setDealerName(user.displayName || user.email?.split("@")[0] || "Dealer");
    } catch (error) {
      setDealerName(user.displayName || user.email?.split("@")[0] || "Dealer");
    } finally {
      setIsDealerNameLoading(false);
    }
  }

  const handleAddListing = async () => {
    if (!user) return

    // Check if user can create a new listing using available tokens
    const availableTokens = planInfo ? Math.max(0, planInfo.totalTokens - planInfo.usedTokens) : 0;
    const now = new Date();
    const planExpired = planInfo?.planEndDate ? planInfo.planEndDate < now : true;
    
    if (!planInfo?.planName || planExpired) {
      toast.error("No active plan found. Please choose a plan to create listings.");
      router.push('/payment-plans');
      return;
    }
    
    if (availableTokens <= 0) {
      toast.error("No available tokens. Please upgrade your plan to create more listings.");
      router.push('/payment-plans');
      return;
    }

    router.push("/dashboard/add-listing")
  }

  const handleEditListing = (id: string) => {
    router.push(`/dashboard/edit-listing/${id}`)
  }

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteListing(id)
      // Reload dashboard data after deletion
      await loadDashboardData()
      toast.success("Listing deleted successfully")
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast.error("Failed to delete listing")
    }
  }

  const handleTokenStatusChange = async () => {
    // Reload dashboard data when token status changes
    await loadDashboardData()
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

  // Filter vehicles based on search query and filters
  const filteredVehicles = allVehicles.filter(vehicle => {
    const matchesSearch = vehicle.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    
    const matchesTokenFilter = tokenFilter === "all" || 
      (tokenFilter === "active" && vehicle.tokenStatus === "active") ||
      (tokenFilter === "inactive" && vehicle.tokenStatus !== "active")
    
    return matchesSearch && matchesStatus && matchesTokenFilter
  })

  const stats = {
    totalListings: allVehicles.length,
    activeListings: activeVehicles.filter(v => v.tokenStatus === 'active').length,
    inactiveListings: allVehicles.filter(v => v.tokenStatus !== 'active').length,
    totalViews: allVehicles.reduce((sum, v) => sum + (v.views || 0), 0),
    totalInquiries: allVehicles.reduce((sum, v) => sum + (v.inquiries || 0), 0),
    totalValue: allVehicles.reduce((sum, v) => sum + (v.price || 0), 0),
    availableTokens: planInfo ? Math.max(0, planInfo.totalTokens - planInfo.usedTokens) : 0
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
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome back, {isDealerNameLoading ? "..." : dealerName || "Dealer"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your dealership and listings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  <h3 className="text-3xl font-bold text-green-600">{stats.activeListings}</h3>
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
                  <p className="text-sm font-medium text-gray-500 mb-1">Available Tokens</p>
                  <h3 className="text-3xl font-bold text-blue-600">{stats.availableTokens}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/*
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Views</p>
                  <h3 className="text-3xl font-bold text-purple-600">{stats.totalViews}</h3>
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
                  <h3 className="text-3xl font-bold text-orange-600">{stats.totalInquiries}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          */}
        </div>

        {/* Plan Information Section */}
        {user && (
          <div className="mb-8">
            <PlanInfoSection 
              userId={user.uid} 
              userType="dealer"
              onPlanUpdate={loadDashboardData}
            />
          </div>
        )}

        <Tabs defaultValue="listings" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm w-full sm:w-auto">
              <TabsTrigger value="listings" className="rounded-md data-[state=active]:bg-gray-100 w-full sm:w-auto">Listings</TabsTrigger>
              {/*
              <TabsTrigger value="analytics" className="rounded-md data-[state=active]:bg-gray-100 w-full sm:w-auto">Analytics</TabsTrigger>
              <TabsTrigger value="inquiries" className="rounded-md data-[state=active]:bg-gray-100 w-full sm:w-auto">Inquiries</TabsTrigger>
              */}
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
                  {/* Status Filters */}
                  {/*
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      onClick={() => setStatusFilter("all")}
                      className={`flex-1 sm:flex-none ${statusFilter === "all" ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      All Status
                    </Button>
                    <Button
                      variant={statusFilter === "active" ? "default" : "outline"}
                      onClick={() => setStatusFilter("active")}
                      className={`flex-1 sm:flex-none ${statusFilter === "active" ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      Available
                    </Button>
                    <Button
                      variant={statusFilter === "sold" ? "default" : "outline"}
                      onClick={() => setStatusFilter("sold")}
                      className={`flex-1 sm:flex-none ${statusFilter === "sold" ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                    >
                      Sold
                    </Button>
                  </div>
                  */}
                </div>
                
                {/* Token Filters */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    variant={tokenFilter === "all" ? "default" : "outline"}
                    onClick={() => setTokenFilter("all")}
                    size="sm"
                    className={`${tokenFilter === "all" ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                  >
                    All Listings
                  </Button>
                  <Button
                    variant={tokenFilter === "active" ? "default" : "outline"}
                    onClick={() => setTokenFilter("active")}
                    size="sm"
                    className={`${tokenFilter === "active" ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                  >
                    ● Active ({stats.activeListings})
                  </Button>
                  <Button
                    variant={tokenFilter === "inactive" ? "default" : "outline"}
                    onClick={() => setTokenFilter("inactive")}
                    size="sm"
                    className={`${tokenFilter === "inactive" ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-50/50 hover:bg-gray-100'}`}
                  >
                    ○ Inactive ({stats.inactiveListings})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {allVehicles.length === 0 ? (
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
                ) : filteredVehicles.length === 0 ? (
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
                        setTokenFilter("all")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  // Vehicles grid with enhanced token management
                  <div className="space-y-4">
                    {filteredVehicles.map((vehicle) => (
                      <TokenizedVehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        userId={user?.uid || ''}
                        userType="dealer"
                        availableTokens={stats.availableTokens}
                        onEdit={handleEditListing}
                        onDelete={(id) => {
                          setListingToDelete(id);
                          setDeleteDialogOpen(true);
                        }}
                        onTokenStatusChange={handleTokenStatusChange}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Listing?</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this listing? This action cannot be undone.<br />
                    <span className="text-red-600 font-semibold">Your token for this listing will be lost.</span>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (listingToDelete) {
                        await handleDeleteListing(listingToDelete);
                        setDeleteDialogOpen(false);
                        setListingToDelete(null);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/*
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
          */}

          {/*
          <TabsContent value="inquiries">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Inquiries</CardTitle>
                <CardDescription>
                  Manage and respond to customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allVehicles.length === 0 ? (
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
                    {allVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full">
                        <div className="w-full sm:w-16 h-32 sm:h-16 relative rounded-lg overflow-hidden mb-2 sm:mb-0">
                          <img
                            src={vehicle.image || vehicle.images?.[0] || '/placeholder.jpg'}
                            alt={vehicle.title || `${vehicle.make} ${vehicle.model}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 w-full text-center sm:text-left">
                          <h3 className="font-semibold text-gray-900">
                            {vehicle.title || `${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vehicle.inquiries || 0} inquiries • {vehicle.views || 0} views
                          </p>
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
          */}

          <TabsContent value="profile">
            <DealerProfileSection />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
} 