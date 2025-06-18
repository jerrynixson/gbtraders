"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Car, 
  Heart, 
  Settings, 
  Shield, 
  Bell,
  Lock,
  Trash2,
  Edit2,
  Camera,
  User,
  Globe,
  UserCircle
} from "lucide-react";

interface UserProfile {
  country: string;
  createdAt: { seconds: number };
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "dealer";
  additionalRoles?: string[];
}

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
  const { user, getUserProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile as UserProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, getUserProfile, router]);

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

  const firstInitial = (userProfile.firstName && userProfile.firstName !== "undefined") ? userProfile.firstName.charAt(0) : '';
  const lastInitial = (userProfile.lastName && userProfile.lastName !== "undefined") ? userProfile.lastName.charAt(0) : '';
  const userInitials = (firstInitial + lastInitial).toUpperCase() || '?';

  const fullName = `${userProfile.firstName && userProfile.firstName !== "undefined" ? userProfile.firstName : ''} ${userProfile.lastName && userProfile.lastName !== "undefined" ? userProfile.lastName : ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header Card */}
          <Card className="mb-8 border-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User avatar" />
                  <AvatarFallback className="text-4xl font-bold text-white bg-blue-600">{userInitials}</AvatarFallback>
                </Avatar>
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
                  <Button variant="outline" className="gap-2 font-semibold border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="default" className="gap-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white">
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
                      <p className="text-lg font-bold text-gray-900">5</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Favorites</p>
                      <p className="text-lg font-bold text-gray-900">12</p>
                    </div>
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
                <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-100">
                  <TabsTrigger value="profile" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    <Car className="h-4 w-4" />
                    My Listings
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex items-center gap-2 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600">
                    <Heart className="h-4 w-4" />
                    Favorites
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
                          <Input id="firstName" defaultValue={userProfile.firstName} className="text-gray-900" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-base font-medium text-gray-900">Last Name</Label>
                          <Input id="lastName" defaultValue={userProfile.lastName} className="text-gray-900" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                        <Input id="email" type="email" defaultValue={userProfile.email} className="text-gray-900" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input id="phone" type="tel" defaultValue="+1 (555) 000-0000" className="text-gray-900" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <Input id="location" defaultValue={userProfile.country} className="text-gray-900" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="flex items-center gap-2 text-base font-medium text-gray-900">
                          <UserCircle className="h-4 w-4" />
                          Account Type
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input id="role" defaultValue={userProfile.role} className="text-gray-900 capitalize" disabled />
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
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-base font-medium text-gray-900">Bio</Label>
                        <textarea
                          id="bio"
                          className="w-full min-h-[100px] p-2 border rounded-md text-gray-900"
                          defaultValue="Car enthusiast and collector..."
                        />
                      </div>
                      <Button className="w-full md:w-auto font-medium">Save Changes</Button>
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
                      <div className="text-center py-12">
                        <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-900 mb-2">No active listings found</p>
                        <p className="text-base text-gray-700 mb-4">Start by adding your first vehicle listing</p>
                        <Button variant="outline" className="gap-2 font-medium">
                          <Car className="h-4 w-4" />
                          Add New Listing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="favorites">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900">Favorite Vehicles</CardTitle>
                      <CardDescription className="text-base text-gray-700">Your saved vehicle listings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-900 mb-2">No favorite vehicles yet</p>
                        <p className="text-base text-gray-700 mb-4">Browse vehicles and add them to your favorites</p>
                        <Button variant="outline" className="gap-2 font-medium">
                          Browse Vehicles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900">Account Settings</CardTitle>
                      <CardDescription className="text-base text-gray-700">Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="flex items-center gap-2 text-base font-medium text-gray-900">
                              <Bell className="h-4 w-4" />
                              Email Notifications
                            </Label>
                            <p className="text-base text-gray-700">
                              Receive email notifications for new messages and updates
                            </p>
                          </div>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          <Label className="flex items-center gap-2 text-base font-medium text-gray-900">
                            <Shield className="h-4 w-4" />
                            Privacy Settings
                          </Label>
                          <p className="text-base text-gray-700">
                            Control who can see your profile and listings
                          </p>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2 text-base font-medium text-gray-900">
                            <Lock className="h-4 w-4" />
                            Change Password
                          </Label>
                          <Input type="password" placeholder="Enter new password" className="text-gray-900" />
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <Label className="text-destructive flex items-center gap-2 text-base font-medium">
                          <Trash2 className="h-4 w-4" />
                          Danger Zone
                        </Label>
                        <p className="text-base text-gray-700">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive" className="gap-2 font-medium">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
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