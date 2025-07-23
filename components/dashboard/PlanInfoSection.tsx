"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Calendar, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';

interface UserPlanInfo {
  planName: string
  planPrice: number
  totalTokens: number
  usedTokens: number
  planStartDate: Date
  planEndDate: Date
  userId: string
  lastPaymentDate?: Date
  purchaseHistory?: Array<{
    purchaseDate: Date
    planName: string
    amount: number
  }>
}

import { 
  formatPlanExpiry, 
  calculateTokenUsage, 
  getPlanStatusColor 
} from '@/lib/utils/tokenUtils';

interface PlanInfoSectionProps {
  userId: string;
  userType?: 'user' | 'dealer';
  onPlanUpdate?: () => void;
}

export function PlanInfoSection({ userId, userType = 'dealer', onPlanUpdate }: PlanInfoSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [planInfo, setPlanInfo] = useState<UserPlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [hasRecentSession, setHasRecentSession] = useState(false);
  const [availableUpgrades, setAvailableUpgrades] = useState<string[]>([]);
  const [loadingUpgrades, setLoadingUpgrades] = useState(false);

  useEffect(() => {
    loadPlanInfo();
    loadAvailableUpgrades();
    // Check for recent payment session (client-side only)
    const recentSession = localStorage.getItem('recent_payment_session');
    setHasRecentSession(!!recentSession);
  }, [userId, userType]);

  const loadPlanInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
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

      // Fetch plan info from API using admin SDK
      const response = await fetch(`/api/plan-info?userType=${userType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch plan information');
      }

      const data = await response.json();
      
      // Convert date strings back to Date objects
      const planInfo = data.planInfo ? {
        ...data.planInfo,
        planStartDate: data.planInfo.planStartDate ? new Date(data.planInfo.planStartDate) : undefined,
        planEndDate: data.planInfo.planEndDate ? new Date(data.planInfo.planEndDate) : undefined,
        lastPaymentDate: data.planInfo.lastPaymentDate ? new Date(data.planInfo.lastPaymentDate) : undefined,
        purchaseHistory: (data.planInfo.purchaseHistory || []).map((record: any) => ({
          ...record,
          purchaseDate: record.purchaseDate ? new Date(record.purchaseDate) : undefined
        }))
      } : null;

      setPlanInfo(planInfo);
      setError(null);
      // Only log in development mode
      if (process.env.NODE_ENV === 'development' && false) { // Disabled logs
        console.log('Plan info loaded:', planInfo);
        console.log('User type:', userType, 'User ID:', userId);
      }
    } catch (err) {
      console.error('Error loading plan info:', err);
      setError('Failed to load plan information');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUpgrades = async () => {
    if (!user) return;

    try {
      setLoadingUpgrades(true);
      
      // Get ID token
      let token;
      try {
        if (user.getIdToken) {
          token = await user.getIdToken();
        } else {
          const currentUser = auth.currentUser;
          if (currentUser) {
            token = await currentUser.getIdToken();
          } else {
            throw new Error('No authenticated user found');
          }
        }
      } catch (tokenError) {
        console.error('Error getting ID token:', tokenError);
        return;
      }

      const response = await fetch(`/api/upgrade-plan?userType=${userType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUpgrades(data.availableUpgrades || []);
      }
    } catch (err) {
      console.error('Error loading available upgrades:', err);
    } finally {
      setLoadingUpgrades(false);
    }
  };

  const handleRefresh = async () => {
    await loadPlanInfo();
    await loadAvailableUpgrades();
    if (onPlanUpdate) {
      onPlanUpdate();
    }
  };

  const handleVerifyRecentPayment = async () => {
    if (!user) return;

    // Check if there's a recent payment session in localStorage
    const recentSessionId = localStorage.getItem('recent_payment_session');
    if (!recentSessionId) {
      toast.info('No recent payment session found');
      return;
    }

    try {
      setVerifyingPayment(true);
      
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
        toast.error('Authentication error - please try logging in again');
        return;
      }
      
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId: recentSessionId })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Payment verified and plan activated!');
        localStorage.removeItem('recent_payment_session'); // Clear the session
        setHasRecentSession(false); // Update state
        await loadPlanInfo(); // Refresh plan info
        if (onPlanUpdate) {
          onPlanUpdate();
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to verify payment');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      toast.error('Network error during verification');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleUpgradePlan = () => {
    // Navigate to payment plans page with upgrade intent
    router.push('/payment-plans?upgrade=true');
  };

  const handleRenewPlan = () => {
    router.push('/payment-plans');
  };

  const getPlanStatus = () => {
    if (!planInfo?.planEndDate) return 'no_plan';
    
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (planInfo.planEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring_soon';
    return 'active';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expiring_soon':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'active':
        return 'Your plan is active and ready to use';
      case 'expiring_soon':
        return 'Your plan is expiring soon - consider renewing';
      case 'expired':
        return 'Your plan has expired - renew to continue creating listings';
      default:
        return 'No active plan - choose a plan to get started';
    }
  };

  if (loading) {
    return (
      <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const status = getPlanStatus();
  const statusColors = getPlanStatusColor(planInfo);
  const tokenUsage = calculateTokenUsage(
    planInfo?.usedTokens || 0, 
    planInfo?.totalTokens || 0
  );

  return (
    <div className="space-y-4">
      {/* Plan Status Alert */}
      {status !== 'active' && (
        <Alert className={`${statusColors.border} ${statusColors.bg}`}>
          {getStatusIcon(status)}
          <AlertDescription className="ml-2">
            {getStatusMessage(status)}
            {status !== 'no_plan' && (
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2 text-blue-600"
                onClick={handleRenewPlan}
              >
                Renew now
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Information Card */}
      <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Plan Information
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
              title="Refresh plan information"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {planInfo?.planName ? (
            <>
              {/* Current Plan */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-semibold text-lg">{planInfo.planName}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${statusColors.border} ${statusColors.bg} ${statusColors.text}`}
                >
                  {getStatusIcon(status)}
                  <span className="ml-1">
                    {status === 'active' ? 'Active' : 
                     status === 'expiring_soon' ? 'Expiring Soon' : 
                     status === 'expired' ? 'Expired' : 'Inactive'}
                  </span>
                </Badge>
              </div>

              {/* Plan Dates */}
              {planInfo.planEndDate && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Plan Expires
                    </p>
                    <p className="font-medium">
                      {formatPlanExpiry(planInfo.planEndDate)}
                    </p>
                  </div>
                  {planInfo.planStartDate && (
                    <div>
                      <p className="text-sm text-gray-600">Started</p>
                      <p className="font-medium">
                        {planInfo.planStartDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Token Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Token Usage
                  </p>
                  <p className="text-sm font-medium">
                    {planInfo.usedTokens} / {planInfo.totalTokens} used
                  </p>
                </div>
                <Progress 
                  value={tokenUsage} 
                  className="h-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {planInfo.totalTokens - planInfo.usedTokens} tokens available
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {status === 'active' ? (
                  // Show upgrade button for active plans if upgrades are available
                  availableUpgrades.length > 0 ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleUpgradePlan}
                      className="flex items-center gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      disabled={loadingUpgrades}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Upgrade Plan
                    </Button>
                  ) : null
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRenewPlan}
                    className="flex items-center gap-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    {status === 'expired' ? 'Renew Plan' : 'Choose Plan'}
                  </Button>
                )}
                {/* <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={loadPlanInfo}
                >
                  Refresh
                </Button> */}
              </div>
            </>
          ) : (
            /* No Plan State */
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">No Active Plan</h3>
              <p className="text-gray-600 text-sm mb-4">
                Choose a plan to start creating vehicle listings
              </p>
              <div className="space-y-2">
                <Button onClick={handleRenewPlan} className="bg-blue-600 hover:bg-blue-700 w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Choose Plan
                </Button>
                {/* Show verify payment button if there's a recent session */}
                {hasRecentSession && (
                  <Button 
                    variant="outline" 
                    onClick={handleVerifyRecentPayment}
                    disabled={verifyingPayment}
                    className="w-full"
                  >
                    {verifyingPayment ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Verify Recent Payment
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Purchase History Summary */}
          {planInfo?.purchaseHistory && planInfo.purchaseHistory.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Recent Purchases</p>
              <div className="space-y-1">
                {planInfo.purchaseHistory.slice(-2).map((purchase, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-500">
                    <span>{purchase.planName}</span>
                    <span>{purchase.purchaseDate.toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
