"use client";

import React, { useState } from 'react';
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
        variant: "default",
      });
      router.push(redirectTo);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow grid md:grid-cols-2 gap-0">
        {/* Left Panel - Image/Illustration */}
        <div className="hidden md:flex flex-col justify-center items-center bg-indigo-900 text-white p-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">Welcome Back</h1>
            <p className="text-indigo-200 text-lg">
              Sign in to access your account and continue your journey with us.
            </p>
            <div className="mt-12 bg-indigo-800/40 p-6 rounded-lg border border-indigo-700">
              <p className="italic text-indigo-200">"The platform's user-friendly interface makes it easy to manage my account and find exactly what I need."</p>
              <p className="text-white mt-3 font-medium">— Sarah Johnson</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Sign In Form */}
        <div className="flex flex-col justify-center p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
              <p className="mt-2 text-gray-600">Enter your details to continue</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                    autoComplete="current-password"
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

              {/* Sign In Button */}
              <button
                type="submit"
                className="relative w-full flex justify-center items-center p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm group mt-4"
              >
                Sign in
                <ArrowRight size={18} className="ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Divider for social options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign in with</span>
                  </div>
                </div>

                {/* Social Sign In Options */}
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

              {/* Sign Up Link */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignInPage;