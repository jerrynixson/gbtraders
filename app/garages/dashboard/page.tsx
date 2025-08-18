"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { 
  Pencil, 
  Trash, 
  Plus, 
  Save, 
  X, 
  Search, 
  Filter,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
  Settings,
  BarChart3,
  Calendar,
  Camera,
  CheckCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  getUserGarages, 
  softDeleteGarage, 
  subscribeToUserGarages
} from "@/lib/garage";
import { type Garage } from "@/lib/types/garage";



export default function GarageManagerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load garages on component mount and when user changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const loadGarages = async () => {
      try {
        setLoading(true);
        
        // Set up real-time subscription
        unsubscribe = subscribeToUserGarages(user.uid, (userGarages) => {
          setGarages(userGarages);
          setLoading(false);
        });
        
      } catch (error) {
        console.error('Error loading garages:', error);
        toast.error('Failed to load garages');
        setLoading(false);
      }
    };

    loadGarages();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const filteredGarages = garages.filter(garage => {
    const matchesSearch = garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         garage.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (garage: Garage) => {
    router.push(`/garages/dashboard/add?edit=${garage.id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this garage?')) {
      try {
        await softDeleteGarage(id);
        toast.success('Garage deleted successfully');
      } catch (error) {
        console.error('Error deleting garage:', error);
        toast.error('Failed to delete garage');
      }
    }
  };

  const stats = {
    total: garages.length,
    avgRating: garages.length > 0 ? garages.reduce((acc, g) => acc + g.rating, 0) / garages.length : 0,
    totalServices: garages.reduce((acc, g) => acc + g.services.length, 0)
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please sign in to manage your garages</h1>
          <Button onClick={() => router.push('/signin')} className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Garage Manager Dashboard
              </h1>
              <p className="text-lg text-gray-600">Manage your garage listings with style and efficiency</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              onClick={() => router.push('/garages/dashboard/add')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Garage
            </Button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Garages</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            {/* Average Rating card commented out per request
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {stats.avgRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
            */}
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {stats.totalServices}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                placeholder="Search garages by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white/70 backdrop-blur-sm"
              />
            </div>

            {/* Enhanced View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200 ${
                  viewMode === "cards" 
                    ? "bg-white shadow-md text-blue-600" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Cards
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200 ${
                  viewMode === "table" 
                    ? "bg-white shadow-md text-blue-600" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Filter className="w-4 h-4" />
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your garages...</p>
          </div>
        )}

        {/* Enhanced Content */}
        {!loading && (
          <>
            {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGarages.map(garage => (
              <div key={garage.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="relative h-52 overflow-hidden">
                  <Image 
                    src={garage.image || '/placeholder.jpg'} 
                    alt={garage.name} 
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1 text-sm font-semibold text-gray-700 shadow-lg">
                      {garage.price}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {garage.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm bg-amber-50 rounded-lg px-2 py-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-amber-700">{garage.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="line-clamp-2">{garage.address}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" />
                    <span>{garage.phone}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {garage.services.slice(0, 3).map((service, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
                        {service}
                      </span>
                    ))}
                    {garage.services.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                        +{garage.services.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/categories/garages/${garage.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(garage)}
                      className="flex-1 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(garage.id)}
                      className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Garage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredGarages.map(garage => (
                    <tr key={garage.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Image 
                            src={garage.image || '/placeholder.jpg'} 
                            alt={garage.name} 
                            width={64} 
                            height={48} 
                            className="rounded-xl object-cover shadow-md"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{garage.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{garage.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-green-500" />
                          {garage.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="w-4 h-4 mr-2 text-blue-500" />
                          {garage.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center bg-amber-50 rounded-lg px-2 py-1 w-fit">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                          <span className="text-sm font-semibold text-amber-700">{garage.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{garage.services.length} services</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link href={`/categories/garages/${garage.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(garage)} className="text-emerald-600 hover:bg-emerald-50 rounded-xl">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(garage.id)} className="text-red-600 hover:bg-red-50 rounded-xl">
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {filteredGarages.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Settings className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No garages found</h3>
              <p className="text-gray-600 mb-6 text-lg">
                {searchTerm ? 'No garages match your search criteria.' : 'Get started by adding your first garage.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/garages/dashboard/add')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Garage
                </Button>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
