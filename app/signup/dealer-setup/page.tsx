"use client"

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DealerProfileSection } from "@/components/dealer/profile"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { FirebaseError } from 'firebase/app';
import { submitDealerProfile, DealerProfile } from "@/lib/dealer/profile";
import { auth } from "@/lib/firebase";

// Custom component for signup flow
function DealerProfileSignupSection({ onProfileComplete }: { onProfileComplete: () => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false);
  const [hasCoordinates, setHasCoordinates] = useState(false);
  const [profile, setProfile] = useState<DealerProfile>({
    businessName: "",
    contact: {
      email: "",
      phone: "",
      website: "",
    },
    description: "",
    location: {
      lat: 0,
      long: 0,
      addressLines: ["", "", "", ""], // 4th element for postcode
    },
    businessHours: {
      mondayToFriday: "",
      saturday: "",
      sunday: "",
    },
    socialMedia: [],
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+44');

  // Handle file selection for logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo file size must be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file for logo");
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file selection for banner
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Banner file size must be less than 10MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file for banner");
        return;
      }

      setBannerFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!profile.businessName.trim()) {
        toast.error("Business name is required");
        return;
      }

      if (!profile.contact.email.trim()) {
        toast.error("Contact email is required");
        return;
      }

      if (!profile.location.addressLines[3].trim()) {
        toast.error("Postcode is required");
        return;
      }

      // Validate postcode before saving
      const postcode = profile.location.addressLines[3];
      const ukPostcodeRegex = /^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2}))$/;
      
      if (!postcode || !ukPostcodeRegex.test(postcode.trim())) {
        toast.error("Please enter a valid UK postcode");
        return;
      }

      setIsSaving(true);
      
      // Combine country code with phone number
      const fullPhoneNumber = profile.contact.phone ? `${phoneCountryCode} ${profile.contact.phone}` : '';
      const profileToSave = {
        ...profile,
        contact: {
          ...profile.contact,
          phone: fullPhoneNumber
        }
      };
      
      await submitDealerProfile(profileToSave, logoFile, bannerFile);
      toast.success("Dealer profile created successfully!");
      onProfileComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getCoordinatesFromPostcode = async (postcode: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const searchQuery = `${postcode} UK`;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}&region=uk&components=country:GB`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch coordinates');
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) {
      throw new Error('No coordinates found for this postcode');
    }
    
    const { lat, lng } = data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  };

  const [isValidPostcode, setIsValidPostcode] = useState(true);

  const validatePostcode = (postcode: string): boolean => {
    const ukPostcodeRegex = /^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2}))$/;
    return postcode.trim() !== "" && ukPostcodeRegex.test(postcode.trim());
  };

  const handlePostcodeChange = async (value: string) => {
    // Format UK postcode (add space if missing)
    let processedValue = value.toUpperCase().replace(/\s+/g, '');
    if (processedValue.length > 3) {
      processedValue = processedValue.slice(0, -3) + ' ' + processedValue.slice(-3);
    }

    const isValid = validatePostcode(processedValue);
    setIsValidPostcode(isValid);

    setProfile(prev => ({
      ...prev,
      location: {
        ...prev.location,
        addressLines: [prev.location.addressLines[0], prev.location.addressLines[1], prev.location.addressLines[2], processedValue] as [string, string, string, string]
      }
    }));

    // Only fetch coordinates if postcode is valid
    if (isValid) {
      setIsFetchingCoordinates(true);
      setHasCoordinates(false);
      try {
        const coordinates = await getCoordinatesFromPostcode(processedValue);
        setProfile(prev => ({
          ...prev,
          location: {
            ...prev.location,
            lat: coordinates.latitude,
            long: coordinates.longitude
          }
        }));
        setHasCoordinates(true);
      } catch (error) {
        console.warn("Could not fetch coordinates:", error);
        toast.error("Could not fetch coordinates for this postcode");
        setHasCoordinates(false);
      } finally {
        setIsFetchingCoordinates(false);
      }
    } else {
      setHasCoordinates(false);
    }
  };

  // Return a simplified form for signup (essential fields only)
  return (
    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Complete Your Dealer Profile</CardTitle>
        <p className="text-gray-600">Fill in the essential information to set up your dealer account.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Images</h3>
          
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Business Logo</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-4 text-center transition-colors"
              >
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 object-contain mx-auto rounded"
                    />
                    <p className="text-sm text-gray-600 mt-2">Click to change logo</p>
                  </div>
                ) : (
                  <div className="w-32 h-32 flex flex-col items-center justify-center">
                    <div className="text-4xl text-gray-400 mb-2">📷</div>
                    <p className="text-sm text-gray-600 font-medium">Upload Logo</p>
                    <p className="text-xs text-gray-500">Max 5MB</p>
                    <p className="text-xs text-gray-500">Recommended: Square aspect ratio</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Business Banner</label>
            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-4 text-center transition-colors block w-full"
              >
                {bannerPreview ? (
                  <div className="relative">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-40 object-cover mx-auto rounded"
                    />
                    <p className="text-sm text-gray-600 mt-2">Click to change banner</p>
                  </div>
                ) : (
                  <div className="w-full h-40 flex flex-col items-center justify-center">
                    <div className="text-4xl text-gray-400 mb-2">🖼️</div>
                    <p className="text-sm text-gray-600 font-medium">Upload Banner Image</p>
                    <p className="text-xs text-gray-500">Max 10MB</p>
                    <p className="text-xs text-gray-500">Recommended: 1200x400px or similar wide format</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Essential Business Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Business Name *</label>
            <input
              type="text"
              value={profile.businessName}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your business name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Contact Email *</label>
            <input
              type="email"
              value={profile.contact.email}
              onChange={(e) => setProfile({
                ...profile,
                contact: { ...profile.contact, email: e.target.value }
              })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="business@example.com"
              required
            />
          </div>
        </div>

        {/* Phone and Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex space-x-2">
              <select
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                className="w-20 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-label="Country code"
              >
                <option value="+44">+44</option>
                <option value="+1">+1</option>
                <option value="+91">+91</option>
              </select>
              <input
                type="tel"
                value={profile.contact.phone}
                onChange={(e) => setProfile({
                  ...profile,
                  contact: { ...profile.contact, phone: e.target.value }
                })}
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="20 1234 5678"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              value={profile.contact.website}
              onChange={(e) => setProfile({
                ...profile,
                contact: { ...profile.contact, website: e.target.value }
              })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.yourbusiness.com"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              value={profile.location.addressLines[0]}
              onChange={(e) => setProfile({
                ...profile,
                location: {
                  ...profile.location,
                  addressLines: [e.target.value, profile.location.addressLines[1], profile.location.addressLines[2], profile.location.addressLines[3]] as [string, string, string, string]
                }
              })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Address Line 1"
            />
            <input
              type="text"
              value={profile.location.addressLines[1]}
              onChange={(e) => setProfile({
                ...profile,
                location: {
                  ...profile.location,
                  addressLines: [profile.location.addressLines[0], e.target.value, profile.location.addressLines[2], profile.location.addressLines[3]] as [string, string, string, string]
                }
              })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Address Line 2 (optional)"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={profile.location.addressLines[2]}
                onChange={(e) => setProfile({
                  ...profile,
                  location: {
                    ...profile.location,
                    addressLines: [profile.location.addressLines[0], profile.location.addressLines[1], e.target.value, profile.location.addressLines[3]] as [string, string, string, string]
                  }
                })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City/Town"
              />
              <div className="relative">
                <input
                  type="text"
                  value={profile.location.addressLines[3]}
                  onChange={(e) => handlePostcodeChange(e.target.value)}
                  placeholder="Postcode *"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isValidPostcode && profile.location.addressLines[3] ? 'border-red-500' : 'border-gray-200'
                  }`}
                  required
                />
                {isFetchingCoordinates && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>
            {!isValidPostcode && profile.location.addressLines[3] && (
              <p className="text-sm text-red-600">Please enter a valid UK postcode</p>
            )}
            {hasCoordinates && (
              <p className="text-sm text-green-600">✓ Location coordinates updated</p>
            )}
          </div>
        </div>

        {/* Business Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Business Description</label>
          <textarea
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Describe your business, services, and what makes you unique..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving Profile...
              </>
            ) : (
              'Complete Registration'
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

interface StoredSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  additionalRoles: string[];
}

export default function DealerSignupPage() {
  const [signupData, setSignupData] = useState<StoredSignupData | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const { signUp, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Retrieve stored signup data from sessionStorage
    const storedData = sessionStorage.getItem('dealerSignupData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setSignupData(parsedData);
      } catch (error) {
        console.error('Error parsing stored signup data:', error);
        toast.error('Invalid signup data. Please start over.');
        router.push('/signup');
      }
    } else {
      // No stored data, redirect back to signup
      toast.error('No signup data found. Please start over.');
      router.push('/signup');
    }
  }, [router]);

  const createDealerAccount = async () => {
    if (!signupData) return;

    setIsCreatingAccount(true);
    setError('');

    try {
      // Create the Firebase user account
      const userCredential = await signUp(
        signupData.email, 
        signupData.password, 
        signupData.firstName, 
        signupData.lastName
      );
      const user = userCredential.user;

      try {
        // Create user document through the API
        const createUserResponse = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            firstName: signupData.firstName,
            lastName: signupData.lastName,
            email: signupData.email,
            country: signupData.country,
            role: 'dealer',
            additionalRoles: signupData.additionalRoles,
            emailVerified: false,
          }),
        });

        if (!createUserResponse.ok) {
          const errorData = await createUserResponse.json();
          throw new Error(errorData.error || 'Failed to create user document');
        }

        // Set user role through the API
        const setRoleResponse = await fetch('/api/auth/set-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            role: 'dealer',
          }),
        });

        if (!setRoleResponse.ok) {
          const errorData = await setRoleResponse.json();
          throw new Error(errorData.error || 'Failed to set user role');
        }

        // Add additional roles if any are selected
        if (signupData.additionalRoles.length > 0) {
          const idToken = await user.getIdToken();

          for (const additionalRole of signupData.additionalRoles) {
            const addRoleResponse = await fetch('/api/auth/manage-additional-roles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({
                uid: user.uid,
                role: additionalRole,
                action: 'add',
              }),
            });

            if (!addRoleResponse.ok) {
              console.error(`Failed to add additional role: ${additionalRole}`);
            }
          }
        }

        // Clear stored signup data
        sessionStorage.removeItem('dealerSignupData');
        
        setAccountCreated(true);
        toast.success("Account created! Please complete your dealer profile.");

      } catch (setupError: any) {
        console.error("Error setting up user:", setupError);
        // If setup fails, sign out the user
        await logout();
        throw setupError;
      }
    } catch (error: any) {
      console.error("Dealer signup error:", error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('This email is already registered. Please sign in instead.');
            break;
          case 'auth/invalid-email':
            setError('The email address is not valid. Please check and try again.');
            break;
          case 'auth/operation-not-allowed':
            setError('Email/password accounts are not enabled. Please contact support.');
            break;
          case 'auth/password-does-not-meet-requirements':
          case 'auth/weak-password':
            setError('Password must contain: at least 6 characters, one uppercase letter, one lowercase letter, and one number.');
            break;
          default:
            setError(error.message || 'An unexpected error occurred during signup. Please try again.');
        }
      } else {
        setError(error.message || 'An error occurred during signup. Please try again.');
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Show loading state while retrieving signup data
  if (!signupData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading signup data...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show verification message if account is created and verification is sent
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Verify Your Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                We've sent a verification link to <strong>{signupData.email}</strong>. 
                Please check your inbox and click the link to verify your account.
              </p>
              <p className="text-sm text-gray-500">
                After verification, you can sign in and complete your dealer profile.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Dealer Registration</h1>
          <p className="text-gray-600">
            Welcome {signupData.firstName}! Please complete your dealer profile to finish registration.
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!accountCreated ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Your Dealer Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Click below to create your dealer account with the information you provided:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
                <li>Name: {signupData.firstName} {signupData.lastName}</li>
                <li>Email: {signupData.email}</li>
                <li>Country: {signupData.country}</li>
                <li>Account Type: Dealer</li>
              </ul>
              <button
                onClick={createDealerAccount}
                disabled={isCreatingAccount}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  'Create Dealer Account'
                )}
              </button>
            </CardContent>
          </Card>
        ) : (
          <DealerProfileSignupSection 
            onProfileComplete={() => {
              setVerificationSent(true);
              toast.success("Dealer profile saved! Please check your email to verify your account.");
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}
