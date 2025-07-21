"use client";

import React, { useState } from 'react';
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Globe } from "lucide-react";
import { PrivacyPolicyModal } from "../../components/privacy-policy-modal";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from 'firebase/app';

const SignUpPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDealerAccount, setIsDealerAccount] = useState(false);
  const [additionalRoles, setAdditionalRoles] = useState<string[]>([]);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const { signUp, logout, sendVerificationEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const toggleAdditionalRole = (role: string) => {
    setAdditionalRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleResendVerification = async () => {
    try {
      // Sign in the user (even if not verified)
      const { signInWithEmailAndPassword, sendEmailVerification: sendFirebaseEmailVerification, signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendFirebaseEmailVerification(userCredential.user);
      await signOut(auth);
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !lastName || !email || !password || !country) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Create the user account
      const userCredential = await signUp(email, password, firstName, lastName);
      const user = userCredential.user;
      const role = isDealerAccount ? 'dealer' : 'user';

      try {
        // Create user document through the API
        const createUserResponse = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: user.uid,
            firstName,
            lastName,
            email,
            country,
            role,
            additionalRoles,
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
            role,
          }),
        });

        if (!setRoleResponse.ok) {
          const errorData = await setRoleResponse.json();
          throw new Error(errorData.error || 'Failed to set user role');
        }

        // Add additional roles if any are selected
        if (additionalRoles.length > 0) {
          // Get the ID token for the newly created user
          const idToken = await user.getIdToken();
          
          for (const additionalRole of additionalRoles) {
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

        // Set verification sent state
        setVerificationSent(true);

        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
          variant: "default",
        });
        
        // Sign out the user until they verify their email
        await logout();
      } catch (setupError: any) {
        console.error("Error setting up user:", setupError);
        // If setup fails, sign out the user
        await logout();
        setError(setupError.message || 'Failed to create your account. Please try again later.');
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(error.message || 'An error occurred during signup. Please try again.');
      }
    }
  };

  // If verification email is sent, show verification message
  if (verificationSent) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.
              </p>
              <button
                onClick={handleResendVerification}
                className="w-full p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm mb-4"
              >
                Resend Verification Email
              </button>
              <p className="text-sm text-gray-500">
                Already verified?{" "}
                <Link href="/signin" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow grid md:grid-cols-2 gap-0">
        {/* Left Panel - Image/Illustration */}
        <div className="hidden md:flex flex-col justify-center items-center bg-indigo-900 text-white p-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">Join Our Community</h1>
            <p className="text-indigo-200 text-lg">
              Create an account today and start your journey to finding the perfect vehicle that matches your needs and style.
            </p>
            <div className="mt-12 bg-indigo-800/40 p-6 rounded-lg border border-indigo-700">
              <p className="italic text-indigo-200">"The signup process was quick and easy. Within minutes I was browsing through their extensive collection."</p>
              <p className="text-white mt-3 font-medium">— Michael Torres</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Sign Up Form */}
        <div className="flex flex-col justify-center p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
              <p className="mt-2 text-gray-600">Fill in your details to get started</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  {error}
                  {error.includes('already registered') && (
                    <span className="ml-2">
                      <Link href="/signin" className="text-indigo-600 hover:text-indigo-500 underline">
                        Sign in here
                      </Link>
                    </span>
                  )}
                </p>
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Dealer Account Toggle */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={isDealerAccount}
                      onChange={() => setIsDealerAccount(!isDealerAccount)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isDealerAccount ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isDealerAccount ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-gray-700 text-sm font-medium">
                    {isDealerAccount ? 'Dealer Account' : 'User Account'}
                  </div>
                </label>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      id="first-name"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 
                      <EyeOff size={18} className="text-gray-400 hover:text-gray-600" /> : 
                      <Eye size={18} className="text-gray-400 hover:text-gray-600" />
                    }
                  </button>
                </div>
              </div>

              {/* Country Dropdown */}
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe size={18} className="text-gray-400" />
                  </div>
                  <select
                    id="country"
                    name="country"
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Additional Roles Selection */}
              {/* <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Services (Optional)
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAdditionalRole('shop')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      additionalRoles.includes('shop')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Shop
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAdditionalRole('garage')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      additionalRoles.includes('garage')
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Garage
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Select additional services if you provide them
                </p>
              </div> */}

              {/* Sign Up Button */}
              <button
                type="submit"
                className="relative w-full flex justify-center items-center p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm group mt-4"
              >
                Create account
                <ArrowRight size={18} className="ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Divider for social options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                {/* Social Sign Up Options */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <button
                      type="button"
                      className="w-full p-3 flex justify-center items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                      <img className="h-5 w-5" src="/google-logo.svg" alt="Google logo" />
                      <span className="ml-2 text-sm font-medium text-gray-700">Google</span>
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      className="w-full p-3 flex justify-center items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                      <img className="h-5 w-5" src="/apple-logo.svg" alt="Apple logo" />
                      <span className="ml-2 text-sm font-medium text-gray-700">Apple</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Sign In Link */}
              <div className="text-center mt-6">
                <p className="text-xs text-gray-500">
                  By signing up, I agree to the{" "}
                  <button 
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-indigo-600 hover:underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button 
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-indigo-600 hover:underline"
                  >
                    Privacy Policy
                  </button>.
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Already have an account?{" "}
                  <Link href={`/signin?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />

      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
};

export default SignUpPage;