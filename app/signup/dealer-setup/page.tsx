"use client"

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { FirebaseError } from 'firebase/app';

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
  const [error, setError] = useState('');
  const { signUp, logout, sendVerificationEmail } = useAuth();
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

  const handleAccountCreation = async () => {
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

        // Send verification email
        await sendVerificationEmail();
        
        // Sign out the user immediately after account creation
        await logout();
        
        // Clear stored signup data
        sessionStorage.removeItem('dealerSignupData');
        
        toast.success("Account created successfully! Please check your email to verify your account before you can sign in.");
        
        // Redirect to signin page with verification message
        router.push('/signin?message=verify-email-dealer');

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Dealer Registration</h1>
          <p className="text-gray-600">
            Welcome {signupData.firstName}! Let's create your dealer account.
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

        <Card>
          <CardHeader>
            <CardTitle>Create Your Dealer Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Account Details:</h3>
              <p><strong>Name:</strong> {signupData.firstName} {signupData.lastName}</p>
              <p><strong>Email:</strong> {signupData.email}</p>
              <p><strong>Country:</strong> {signupData.country}</p>
              <p><strong>Account Type:</strong> Dealer</p>
              {signupData.additionalRoles.length > 0 && (
                <p><strong>Additional Roles:</strong> {signupData.additionalRoles.join(', ')}</p>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Email Verification Required</h3>
                  <p className="text-blue-700 text-sm">
                    After creating your account, you'll need to verify your email address before you can sign in and access the platform. You can complete your dealer profile after verification.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleAccountCreation}
              disabled={isCreatingAccount}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isCreatingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
