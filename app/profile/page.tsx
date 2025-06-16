"use client";

import React, { useEffect, useState } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { User, Globe, Calendar, Mail, UserCircle } from 'lucide-react';

interface UserProfile {
  country: string;
  createdAt: { seconds: number };
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "dealer";
}

const ProfilePage: React.FC = () => {
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
  }, [user, getUserProfile]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  // If no user or profile, the useEffect will handle the redirect
  if (!user || !userProfile) {
    return null;
  }

  const createdDate = userProfile.createdAt 
    ? format(new Date(userProfile.createdAt.seconds * 1000), 'MMMM dd, yyyy')
    : 'N/A';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow grid md:grid-cols-2 gap-0">
        {/* Left Panel - Profile Summary */}
        <div className="hidden md:flex flex-col justify-center items-center bg-indigo-900 text-white p-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">Your Profile</h1>
            <p className="text-indigo-200 text-lg">
              Manage your account details and preferences.
            </p>
            <div className="mt-12 bg-indigo-800/40 p-6 rounded-lg border border-indigo-700">
              <p className="text-indigo-200">
                Member since {createdDate}
              </p>
              <p className="text-white mt-3 font-medium">
                {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)} Account
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Profile Details */}
        <div className="flex flex-col justify-center p-6 lg:p-8">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Profile Details</h2>
              <p className="mt-2 text-gray-600">View and manage your account information</p>
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{`${userProfile.firstName} ${userProfile.lastName}`}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
              </div>

              {/* Country */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Globe className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{userProfile.country}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <UserCircle className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="font-medium capitalize">{userProfile.role}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{createdDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage; 