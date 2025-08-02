"use client"

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const sessionId = searchParams.get('session_id');
  const isUpgrade = searchParams.get('upgrade') === 'true';
  const isRenewal = searchParams.get('renewal') === 'true';
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const hasVerified = useRef(false);

  const verifyPayment = async () => {
    if (!sessionId || !user) return;

    // Prevent duplicate verification attempts
    const verificationKey = `verifying_${sessionId}`;
    if (sessionStorage.getItem(verificationKey)) {
      console.log('Payment verification already in progress for session:', sessionId);
      return;
    }

    try {
      setVerifying(true);
      
      // Mark as verifying to prevent duplicate calls
      sessionStorage.setItem(verificationKey, 'true');
      
      // Store session ID for later verification if needed
      localStorage.setItem('recent_payment_session', sessionId);
      
      // Get ID token - try user method first, then fallback to auth.currentUser
      let token;
      try {
        if (user.getIdToken) {
          token = await user.getIdToken();
        } else {
          // Fallback: get token from auth.currentUser
          const currentUser = auth.currentUser;
          if (currentUser) {
            token = await currentUser.getIdToken();
          } else {
            throw new Error('No authenticated user found');
          }
        }
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        setError('Authentication error - please try logging in again');
        return;
      }
      
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        setVerified(true);
        setError(null);
        
        if (data.alreadyProcessed) {
          toast.success('Payment already verified!');
        } else {
          toast.success('Payment verified and plan activated!');
        }
        
        // Remove from localStorage on successful verification
        localStorage.removeItem('recent_payment_session');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to verify payment');
        toast.error('Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError('Network error during verification');
      toast.error('Network error during verification');
    } finally {
      // Clear the verification flag
      sessionStorage.removeItem(verificationKey);
      setVerifying(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('PaymentSuccess - sessionId:', sessionId, 'user:', !!user, 'hasVerified:', hasVerified.current);
    if (sessionId && user && !hasVerified.current) {
      hasVerified.current = true;
      verifyPayment();
    } else if (!sessionId) {
      setLoading(false);
      setError('No session ID provided');
    }
  }, [sessionId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-center text-red-600">Payment Verification Issue</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button 
                onClick={verifyPayment}
                disabled={verifying}
                className="w-full"
              >
                {verifying ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry Verification
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/payment-plans')}
                className="w-full"
              >
                Back to Payment Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
            <Button onClick={() => router.push('/payment-plans')}>
              Back to Payment Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-center text-green-600">
            {isUpgrade ? 'Plan Upgraded Successfully!' : 
             isRenewal ? 'Plan Renewed Successfully!' : 
             'Payment Successful!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            {isUpgrade 
              ? 'Your plan has been upgraded successfully. All your active vehicles have been updated with the new expiration date.'
              : isRenewal
              ? 'Your plan has been renewed successfully. All your active vehicles have been updated with the extended expiration date.'
              : 'Your payment has been processed successfully. Your plan has been activated and you can now create listings.'
            }
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full mb-2"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/add-listing')}
              className="w-full"
            >
              Create Listing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
