"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { getDealerListings } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  Settings, 
  Trash2,
  Edit2,
  User,
  Globe,
  UserCircle,
  Heart,
  ChevronRight,
  Save,
  X,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FavoritesRepository } from "@/lib/db/repositories/favoritesRepository";
import { VehicleRepository } from "@/lib/db/repositories/vehicleRepository";
import { auth, storage } from "@/lib/firebase";
import { deleteUser } from "firebase/auth";
import { ref, listAll, deleteObject } from "firebase/storage";

interface UserProfile {
  country: string;
  createdAt: { seconds: number };
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "dealer";
  additionalRoles?: string[];
}

interface DealerVehicle {
  id: string;
  title: string;
  price: number;
  status: string;
  views: number;
  inquiries: number;
  createdAt: string;
  image: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  description: string;
  images: string[];
  updatedAt: string;
}

const favoritesRepo = new FavoritesRepository();
const vehicleRepo = new VehicleRepository();

// Utility to normalize Firestore Timestamp, string, Date, or number to Date
function parseDate(date: any): Date | null {
  if (!date) return null;
  if (typeof date === 'string' || date instanceof String) {
    const d = new Date(date as string);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof date === 'number') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  if (typeof date === 'object' && typeof date.seconds === 'number') {
    // Firestore Timestamp
    return new Date(date.seconds * 1000);
  }
  return null;
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<DealerVehicle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user, getUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile as UserProfile);
        setEditedProfile(profile as UserProfile);

        // Fetch vehicles if user is a dealer
        if (profile && profile.role === 'dealer') {
          const dealerVehicles = await getDealerListings(user.uid);
          setVehicles(dealerVehicles);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, getUserProfile, router]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedProfile({ ...userProfile! });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({ ...userProfile! });
  };

  const handleSaveChanges = async () => {
    if (!editedProfile || !user) return;

    setIsSaving(true);
    try {
      // Update user profile through the API
      const updateProfileResponse = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          firstName: editedProfile.firstName,
          lastName: editedProfile.lastName,
          country: editedProfile.country,
          role: editedProfile.role,
        }),
      });

      const responseData = await updateProfileResponse.json();

      if (!updateProfileResponse.ok) {
        throw new Error(responseData.error || 'Failed to update profile');
      }

      // If role has changed, update user role through the API
      if (userProfile?.role !== editedProfile.role) {
        const setRoleResponse = await fetch('/api/auth/set-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            role: editedProfile.role,
          }),
        });

        const roleResponseData = await setRoleResponse.json();

        if (!setRoleResponse.ok) {
          throw new Error(roleResponseData.error || 'Failed to update user role');
        }
      }

      // Update local state
      setUserProfile(editedProfile);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });

    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !userProfile) return;

    setIsDeleting(true);
    try {
      // Check if user is an admin
      if (userProfile.additionalRoles?.includes('admin')) {
        toast({
          title: "Error",
          description: "Admin accounts cannot be deleted.",
          variant: "destructive",
        });
        return;
      }

      // 1. Delete favorites
      await favoritesRepo.deleteUserFavorites(user.uid);

      // 2. Delete vehicle listings if they exist
      const userVehicles = await vehicleRepo.getVehiclesByDealerId(user.uid);
      
      // Delete vehicle images from storage using admin API
      if (userVehicles.length > 0) {
        await fetch('/api/auth/delete-storage', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, type: 'vehicles' })
        });
      }
      
      // Delete vehicle documents
      for (const vehicle of userVehicles) {
        await vehicleRepo.deleteVehicle(vehicle.id);
      }

      // 3. Delete dealer profile if user is a dealer
      if (userProfile.role === 'dealer') {
        // Delete dealer profile images using admin API
        await fetch('/api/auth/delete-storage', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid, type: 'dealer' })
        });

        // Delete dealer profile document
        await fetch('/api/dealer/profile', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: user.uid }),
        });
      }

      // 4. Delete user profile and auth account
      await fetch('/api/auth/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      });

      // No need to call deleteUser here, as the backend already deleted the user.
      // Optionally, sign out the user if still signed in:
      if (auth.currentUser) {
        await auth.signOut();
      }

      toast({
        title: "Success",
        description: "Your account has been deleted successfully.",
        variant: "default",
      });

      // Redirect to home page and stop further execution
      router.push('/');
      return;

    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no user or profile, the useEffect will handle the redirect
  if (!user || !userProfile) {
    return null;
  }

  const createdDateObj = parseDate(userProfile.createdAt);
  const createdDate = createdDateObj ? format(createdDateObj, 'MMMM dd, yyyy') : 'N/A';

  const fullName = `${userProfile.firstName && userProfile.firstName !== "undefined" ? userProfile.firstName : ''} ${userProfile.lastName && userProfile.lastName !== "undefined" ? userProfile.lastName : ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header Card */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <CardTitle className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    {fullName}
                  </CardTitle>
                  <CardDescription className="text-xl font-semibold text-blue-600 mt-1">
                    {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} Account
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                    <Badge variant="secondary" className="text-sm font-semibold bg-blue-100 text-blue-700">Verified</Badge>
                    <Badge variant="outline" className="text-sm font-semibold border-blue-200 text-blue-700">
                      Member since {createdDate}
                    </Badge>
                    {userProfile.additionalRoles && userProfile.additionalRoles.length > 0 && (
                      userProfile.additionalRoles.map((role) => (
                        <Badge key={role} variant="outline" className="text-sm font-semibold border-green-200 text-green-700">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="gap-2 font-semibold border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={handleEditClick}
                    disabled={isEditing}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="default" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push('/dashboard/add-listing')}>
                    <Car className="h-4 w-4" />
                    Add Listing
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Listings</p>
                      <p className="text-lg font-bold text-gray-900">{vehicles.length}</p>
                    </div>
                  </div>
                  <div 
                    className="group cursor-pointer flex items-center justify-between hover:text-blue-600 transition-colors p-1 -m-1 rounded hover:bg-blue-50"
                    onClick={() => router.push('/favourites')}
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-blue-600 group-hover:fill-current" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Favorites</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-lg font-bold text-gray-900">{createdDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Account Type</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{userProfile.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Country</p>
                      <p className="text-lg font-bold text-gray-900">{userProfile.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100">
                  <TabsTrigger value="profile" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    <Car className="h-4 w-4" />
                    My Listings
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900">Personal Information</CardTitle>
                      <CardDescription className="text-base text-gray-700">Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-base font-medium text-gray-900">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={isEditing ? editedProfile?.firstName : userProfile.firstName} 
                            onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev!, firstName: e.target.value }))}
                            className="text-gray-900" 
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-base font-medium text-gray-900">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={isEditing ? editedProfile?.lastName : userProfile.lastName} 
                            onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev!, lastName: e.target.value }))}
                            className="text-gray-900" 
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={userProfile.email} 
                          className="text-gray-900" 
                          disabled 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <Input 
                          id="location" 
                          value={isEditing ? editedProfile?.country : userProfile.country} 
                          onChange={(e) => isEditing && setEditedProfile(prev => ({ ...prev!, country: e.target.value }))}
                          className="text-gray-900" 
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <UserCircle className="h-4 w-4" />
                          Account Type
                        </Label>
                        <p className="text-sm text-gray-500 mb-2">
                          {userProfile.role === 'user' ? 
                            "You can upgrade your account to a Dealer account to list vehicles." :
                            "Dealer accounts cannot be downgraded to regular user accounts."
                          }
                        </p>
                        <div className="flex items-center gap-2">
                          {isEditing && userProfile.role === 'user' ? (
                            <select
                              id="role"
                              value={editedProfile?.role}
                              onChange={(e) => setEditedProfile(prev => ({ ...prev!, role: e.target.value as "user" | "dealer" }))}
                              className="w-full p-2 text-gray-900 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="user">User</option>
                              <option value="dealer">Dealer</option>
                            </select>
                          ) : (
                            <Input id="role" value={userProfile.role} className="text-gray-900 capitalize" disabled />
                          )}
                          {userProfile.additionalRoles && userProfile.additionalRoles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {userProfile.additionalRoles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs font-medium bg-green-100 text-green-700">
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator className="my-4" />
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSaveChanges} 
                            className="gap-2 font-medium"
                            disabled={isSaving}
                          >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            className="gap-2 font-medium"
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full md:w-auto font-medium" onClick={handleEditClick}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="listings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900">My Vehicle Listings</CardTitle>
                      <CardDescription className="text-base text-gray-700">Manage your vehicle listings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {vehicles.length === 0 ? (
                        <div className="text-center py-12">
                          <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-xl font-bold text-gray-900 mb-2">No active listings found</p>
                          <p className="text-base text-gray-700 mb-4">Start by adding your first vehicle listing</p>
                          <Button variant="outline" className="gap-2 font-medium" onClick={() => router.push('/dashboard/add-listing')}>
                            <Car className="h-4 w-4" />
                            Add New Listing
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {vehicles.map((vehicle) => (
                            <Card key={vehicle.id} className="p-4">
                              <div className="flex items-center gap-4">
                                <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                                  <img 
                                    src={vehicle.image} 
                                    alt={vehicle.title}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900">{vehicle.title}</h3>
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Price:</span> £{vehicle.price.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Status:</span> {vehicle.status}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Views:</span> {vehicle.views}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">Inquiries:</span> {vehicle.inquiries}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="gap-1">
                                    <Edit2 className="h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button variant="destructive" size="sm" className="gap-1">
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900">Account Settings</CardTitle>
                      
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-destructive flex items-center gap-2 text-base font-medium">
                          <Trash2 className="h-4 w-4" />
                          Danger Zone
                        </Label>
                        <p className="text-base text-gray-700">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button 
                          variant="destructive" 
                          className="gap-2 font-medium"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          disabled={isDeleting || userProfile?.additionalRoles?.includes('admin')}
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>

                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Delete Account
                              </AlertDialogTitle>
                              <div className="space-y-4">
                                <AlertDialogDescription>
                                  Are you absolutely sure you want to delete your account? This action cannot be undone.
                                </AlertDialogDescription>
                                <div>
                                  <div className="font-semibold mb-2">This will permanently delete:</div>
                                  <ul className="list-disc list-inside space-y-1">
                                    <li>Your profile information</li>
                                    <li>All your favorite listings</li>
                                    {userProfile?.role === 'dealer' && (
                                      <>
                                        <li>All your vehicle listings</li>
                                        <li>Your dealer profile</li>
                                      </>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isDeleting ? "Deleting..." : "Delete Account"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}