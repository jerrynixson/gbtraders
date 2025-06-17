"use client";

import React, { useEffect, useState } from 'react';
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VerifyEmailPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const { user, completeEmailSignIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get email from localStorage (set during signup)
        const email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          throw new Error('No email found for verification. Please try signing up again.');
        }

        // Complete the email verification process
        const userCredential = await completeEmailSignIn(email);
        
        // Update the user's verification status in Firestore
        if (userCredential.user) {
          await updateDoc(doc(db, "users", userCredential.user.uid), {
            emailVerified: true
          });
        }

        // Clear the stored email
        window.localStorage.removeItem('emailForSignIn');

        setVerificationStatus('success');
        toast({
          title: "Email Verified!",
          description: "Your email has been verified successfully. You can now sign in.",
          variant: "default",
        });

        // Redirect to signin page after a short delay
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setError(error.message || 'Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            {verificationStatus === 'verifying' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
                <p className="text-gray-600">
                  Your email has been verified successfully. You will be redirected to the sign in page shortly.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => router.push('/signin')}
                    className="text-indigo-600 hover:text-indigo-500 font-semibold"
                  >
                    Sign in now
                  </button>
                </div>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
                <p className="text-gray-600 mb-4">
                  {error || 'There was a problem verifying your email. Please try again.'}
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/signup')}
                    className="text-indigo-600 hover:text-indigo-500 font-semibold"
                  >
                    Try signing up again
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={() => router.push('/signin')}
                    className="text-indigo-600 hover:text-indigo-500 font-semibold"
                  >
                    Sign in
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmailPage; 