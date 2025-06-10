import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";
import React from "react";

export interface DealerProfile {
  businessName: string;
  contactEmail: string;
  phoneNumber: string;
  location: string;
  website: string;
  description: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    newInquiries: boolean;
    listingUpdates: boolean;
    marketing: boolean;
  };
  logo: string;
  coverImage: string;
}

interface DealerProfileSectionProps {
  profile: DealerProfile;
  isEditing: boolean;
  isSaving: boolean;
  onEditToggle: () => void;
  onProfileChange: (field: string, value: any) => void;
  onBusinessHoursChange: (day: string, value: string) => void;
  onSocialMediaChange: (platform: string, value: string) => void;
  onNotificationChange: (type: string, value: boolean) => void;
  onSaveProfile: () => void;
  onCancelEdit: () => void;
}

export function DealerProfileSection({
  profile,
  isEditing,
  isSaving,
  onEditToggle,
  onProfileChange,
  onBusinessHoursChange,
  onSocialMediaChange,
  onNotificationChange,
  onSaveProfile,
  onCancelEdit,
}: DealerProfileSectionProps) {
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
            variant={isEditing ? "outline" : "default"}
            onClick={onEditToggle}
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
            <h3 className="text-lg font-medium">Basic Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={profile.businessName}
                  onChange={(e) => onProfileChange("businessName", e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={profile.contactEmail}
                  onChange={(e) => onProfileChange("contactEmail", e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => onProfileChange("phoneNumber", e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={profile.website}
                  onChange={(e) => onProfileChange("website", e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Location</Label>
                <Input
                  value={profile.location}
                  onChange={(e) => onProfileChange("location", e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Business Description</Label>
                <Textarea
                  value={profile.description}
                  onChange={(e) => onProfileChange("description", e.target.value)}
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
                    onChange={(e) => onBusinessHoursChange(day, e.target.value)}
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
                    onChange={(e) => onSocialMediaChange(platform, e.target.value)}
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
            <h3 className="text-lg font-medium">Notification Preferences</h3>
            <div className="space-y-4">
              {Object.entries(profile.notifications).map(([type, enabled]) => (
                <div key={type} className="flex items-center justify-between">
                  <Label className="capitalize">
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => onNotificationChange(type, checked)}
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
                onClick={onCancelEdit}
                disabled={isSaving}
                className="bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={onSaveProfile}
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
  );
} 