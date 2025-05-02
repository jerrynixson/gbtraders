"use client";

import React, { useState } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
    window.location.href = "/signup";
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-grow grid md:grid-cols-2 gap-0">
        {/* Left Panel - Image/Illustration */}
        <div className="hidden md:flex flex-col justify-center items-center bg-indigo-900 text-white p-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">Find Your Perfect Ride</h1>
            <p className="text-indigo-200 text-lg">
              Access exclusive deals and personalized recommendations for your next dream car.
            </p>
            <div className="mt-12 bg-indigo-800/40 p-6 rounded-lg border border-indigo-700">
              <p className="italic text-indigo-200">"This platform made finding my perfect car so easy. Highly recommended!"</p>
              <p className="text-white mt-3 font-medium">— </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-gray-600">Please enter your details to sign in</p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    Forgot password?
                  </a>
                </div>
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
                className="relative w-full flex justify-center items-center p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm group"
              >
                Sign in
                <ArrowRight size={18} className="ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Social Login Options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full p-3 flex justify-center items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <img className="h-5 w-5" src="/google-logo.svg" alt="Google logo" />
                    <span className="ml-2 text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button
                    type="button"
                    className="w-full p-3 flex justify-center items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <img className="h-5 w-5" src="/apple-logo.svg" alt="Apple logo" />
                    <span className="ml-2 text-sm font-medium text-gray-700">Apple</span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center mt-8">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Create an account
                  </a>
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  By signing in, you agree to our{" "}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPrivacyModalOpen(true);
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    Terms
                  </button>{" "}
                  and{" "}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPrivacyModalOpen(true);
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    Privacy Policy
                  </button>.
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

export default LoginPage;