"use client";

import React, { useState, useEffect } from 'react';
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { PrivacyPolicyModal } from "../../components/privacy-policy-modal";
import { Eye, EyeOff, ArrowRight, Mail, Lock } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, sendEmailVerification as sendFirebaseEmailVerification, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isEmailLink, setIsEmailLink] = useState(false);
  const { signIn, sendVerificationEmail, completeEmailSignIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  useEffect(() => {
    // Check if this is an email sign-in link
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (storedEmail) {
      setEmail(storedEmail);
      setIsEmailLink(true);
      handleEmailLinkSignIn(storedEmail);
    }
    
    // Check for verification message
    const message = searchParams.get('message');
    if (message === 'verify-email-dealer') {
      setError('Please check your email and verify your account before signing in. If you don\'t see the email, check your spam folder.');
    }
  }, [searchParams]);

  const handleEmailLinkSignIn = async (storedEmail: string) => {
    try {
      await completeEmailSignIn(storedEmail);
      window.localStorage.removeItem('emailForSignIn');
      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
        variant: "default",
      });
      router.push(redirectTo);
    } catch (error: any) {
      setError('Invalid Credential');
    }
  };

  const handleResendVerification = async () => {
    try {
      // Sign in the user (even if not verified)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Send verification email
      await sendFirebaseEmailVerification(userCredential.user);
      // Optionally sign out the user immediately
      await signOut(auth);
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error resending verification",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus('idle');
    setResetMessage('');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus('success');
      setResetMessage('If your email is registered, you will receive a password reset email in your inbox.');
    } catch (error: any) {
      setResetStatus('error');
      setResetMessage(error.message || 'Failed to send password reset email.');
    }
  };

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
      setError('Invalid Credentials');
      // If the error is about email verification, show the resend button
      if (error.message.includes('verify your email')) {
        return (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 mb-2">{error.message}</p>
            <button
              onClick={handleResendVerification}
              className="text-sm text-yellow-800 underline hover:text-yellow-900"
            >
              Resend verification email
            </button>
          </div>
        );
      }
    }
  };

  // If this is an email sign-in link but we don't have the email, show an input form
  if (isEmailLink && !email) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Sign In</h2>
            <p className="text-gray-600 mb-4">
              Please enter your email address to complete the sign in process.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEmailLinkSignIn(email);
            }}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full mt-4 p-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Complete Sign In
              </button>
            </form>
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
              <div className={`mb-4 p-3 rounded-lg ${error.includes('verify your email') ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={error.includes('verify your email') ? 'text-yellow-800' : 'text-red-600'}>
                  {error}
                </p>
                {error.includes('verify your email') && (
                  <button
                    onClick={handleResendVerification}
                    className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                  >
                    Resend verification email
                  </button>
                )}
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
                {/* Forgot Password Link */}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    className="text-sm text-indigo-600 hover:underline focus:outline-none"
                    onClick={() => setShowForgotPassword((v) => !v)}
                  >
                    Forgot Password?
                  </button>
                </div>
                {/* Forgot Password Form (not a <form> to avoid nested forms) */}
                {showForgotPassword && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">Enter your email address</label>
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-200 rounded-lg mb-2"
                      placeholder="you@example.com"
                    />
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="w-full p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Send Reset Email
                    </button>
                    {resetStatus === 'success' && (
                      <p className="mt-2 text-green-600 text-sm">{resetMessage}</p>
                    )}
                    {resetStatus === 'error' && (
                      <p className="mt-2 text-red-600 text-sm">{resetMessage}</p>
                    )}
                  </div>
                )}
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
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        // TODO: Implement Google sign-in
                        console.log('Google sign-in clicked');
                      }}
                      className="w-full p-3 flex justify-center items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <img className="h-5 w-5" src="/google-logo.svg" alt="Google logo" />
                      <span className="ml-2 text-sm font-medium text-gray-700">Google</span>
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        // TODO: Implement Apple sign-in
                        console.log('Apple sign-in clicked');
                      }}
                      className="w-full p-3 flex justify-center items-center bg-black border border-gray-200 rounded-lg shadow-sm hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <img className="h-5 w-5 filter brightness-0 invert" src="/apple-logo.svg" alt="Apple logo" />
                      <span className="ml-2 text-sm font-medium text-white">Apple</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy Policy */}
              <div className="text-center mt-6">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-indigo-600 hover:underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-indigo-600 hover:underline"
                  >
                    Privacy Policy
                  </button>.
                </p>
              </div>

              {/* Sign Up Link */}
              <div className="text-center mt-4">
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
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </div>
  );
};

export default SignInPage;