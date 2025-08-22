import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, MapPin, Check } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { getDealerProfile, submitDealerProfile, DealerProfile } from "@/lib/dealer/profile";
import { toast } from "sonner";

export function DealerProfileSection() {
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

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    // Fetch existing profile data
    const fetchProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const existingProfile = await getDealerProfile(currentUser.uid);
          if (existingProfile) {
            setProfile({
              businessName: existingProfile.businessName,
              contact: existingProfile.contact,
              description: existingProfile.description,
              location: {
                lat: existingProfile.location.lat,
                long: existingProfile.location.long,
                addressLines: [
                  existingProfile.location.addressLines[0] || "",
                  existingProfile.location.addressLines[1] || "",
                  existingProfile.location.addressLines[2] || "",
                  existingProfile.location.addressLines[3] || (existingProfile.location as any).postcode || ""
                ] as [string, string, string, string],
              },
              businessHours: existingProfile.businessHours,
              socialMedia: existingProfile.socialMedia,
              dealerLogoUrl: existingProfile.dealerLogoUrl,
              dealerBannerUrl: existingProfile.dealerBannerUrl,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
      } else {
        setBannerFile(file);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Validate postcode before saving
      const postcode = profile.location.addressLines[3];
      const ukPostcodeRegex = /^(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2}))$/;
      
      if (!postcode || !ukPostcodeRegex.test(postcode.trim())) {
        toast.error("Please enter a valid UK postcode");
        return;
      }

      setIsSaving(true);
      await submitDealerProfile(profile, logoFile, bannerFile);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
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

  return (
    <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dealer Profile</CardTitle>
            <CardDescription>
              Manage your dealer account profile and information
            </CardDescription>
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Saving..." : "Save Changes"}
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
                      src={logoFile ? URL.createObjectURL(logoFile) : profile.dealerLogoUrl || "/placeholder.svg"}
                      alt="Business Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={(e) => handleFileChange(e, 'logo')}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Logo
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                    <img
                      src={bannerFile ? URL.createObjectURL(bannerFile) : profile.dealerBannerUrl || "/placeholder.svg"}
                      alt="Cover Image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={bannerInputRef}
                      onChange={(e) => handleFileChange(e, 'banner')}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white"
                      onClick={() => bannerInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change Cover
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={profile.businessName}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={profile.contact.email}
                  onChange={(e) => setProfile({
                    ...profile,
                    contact: { ...profile.contact, email: e.target.value }
                  })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={profile.contact.phone}
                  onChange={(e) => setProfile({
                    ...profile,
                    contact: { ...profile.contact, phone: e.target.value }
                  })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={profile.contact.website}
                  onChange={(e) => setProfile({
                    ...profile,
                    contact: { ...profile.contact, website: e.target.value }
                  })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address Line 1</Label>
                <Input
                  value={profile.location.addressLines[0]}
                  onChange={(e) => setProfile({
                    ...profile,
                    location: {
                      ...profile.location,
                      addressLines: [e.target.value, profile.location.addressLines[1], profile.location.addressLines[2], profile.location.addressLines[3]] as [string, string, string, string]
                    }
                  })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address Line 2</Label>
                <Input
                  value={profile.location.addressLines[1]}
                  onChange={(e) => setProfile({
                    ...profile,
                    location: {
                      ...profile.location,
                      addressLines: [profile.location.addressLines[0], e.target.value, profile.location.addressLines[2], profile.location.addressLines[3]] as [string, string, string, string]
                    }
                  })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address Line 3</Label>
                <Input
                  value={profile.location.addressLines[2]}
                  onChange={(e) => setProfile({
                    ...profile,
                    location: {
                      ...profile.location,
                      addressLines: [profile.location.addressLines[0], profile.location.addressLines[1], e.target.value, profile.location.addressLines[3]] as [string, string, string, string]
                    }
                  })}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Postcode
                  {isFetchingCoordinates ? (
                    <MapPin className="h-4 w-4 text-blue-500" />
                  ) : hasCoordinates ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : null}
                </Label>
                <Input
                  value={profile.location.addressLines[3]}
                  onChange={(e) => handlePostcodeChange(e.target.value)}
                  placeholder="e.g., SW1A 1AA"
                  className={`bg-gray-50 ${!isValidPostcode && profile.location.addressLines[3] ? 'border-red-500 focus:ring-red-500' : ''}`}
                  aria-invalid={!isValidPostcode}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Business Description (max 100 words)</Label>
                <Textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
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
              <div className="space-y-2">
                <Label>Monday to Friday</Label>
                <Input
                  value={profile.businessHours.mondayToFriday}
                  onChange={(e) => setProfile({
                    ...profile,
                    businessHours: { ...profile.businessHours, mondayToFriday: e.target.value }
                  })}
                  className="bg-gray-50"
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                />
              </div>
              <div className="space-y-2">
                <Label>Saturday</Label>
                <Input
                  value={profile.businessHours.saturday}
                  onChange={(e) => setProfile({
                    ...profile,
                    businessHours: { ...profile.businessHours, saturday: e.target.value }
                  })}
                  className="bg-gray-50"
                  placeholder="e.g., 10:00 AM - 4:00 PM"
                />
              </div>
              <div className="space-y-2">
                <Label>Sunday</Label>
                  <Input
                  value={profile.businessHours.sunday}
                  onChange={(e) => setProfile({
                    ...profile,
                    businessHours: { ...profile.businessHours, sunday: e.target.value }
                  })}
                    className="bg-gray-50"
                  placeholder="e.g., Closed"
                  />
                </div>
            </div>
          </div>

          <Separator />

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media Links</h3>
            <div className="space-y-4">
              {profile.socialMedia.map((url, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newSocialMedia = [...profile.socialMedia];
                      newSocialMedia[index] = e.target.value;
                      setProfile({ ...profile, socialMedia: newSocialMedia });
                    }}
                    className="bg-gray-50"
                    placeholder="https://"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newSocialMedia = profile.socialMedia.filter((_, i) => i !== index);
                      setProfile({ ...profile, socialMedia: newSocialMedia });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setProfile({
                  ...profile,
                  socialMedia: [...profile.socialMedia, ""]
                })}
              >
                Add Social Media Link
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 