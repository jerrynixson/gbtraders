"use client";

import React, { useState } from 'react';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Globe } from "lucide-react";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";

const SignUpPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDealerAccount, setIsDealerAccount] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up attempt with:', { firstName, lastName, email, password, country, isDealerAccount });
  };

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
                  <div className="ml-3 text-gray-700 text-sm font-medium">Account for Dealers</div>
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
                  <a href="/signin" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </a>
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