"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { Check, Star, Zap, Crown, TrendingUp, Shield, Loader2, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const plans = [
  {
    name: "Basic",
    originalPrice: "£25.00",
    price: "£25.00",
    couponCode: "BASIC25",
    couponDiscount: "£25.00",
    image: "/images/basic-package.jpg",
    features: [
      "One Free Listing",
      "7 days Listing period",
      "Renew for free",
      "Basic support"
    ],
    isFeatured: false,
    buttonText: "Get Free Plan",
    icon: Shield,
    color: "blue",
    description: "Perfect for getting started",
    token: 1,
    validity: 7
  },
  {
    name: "Private Gold",
    originalPrice: "£25.00",
    price: "£25.00",
    couponCode: "PRIVATEGOLD20",
    couponDiscount: "£20.00",
    features: [
      "One Listing",
      "30 Days Listing period",
      "Priority support",
      "Advanced dashboard"
    ],
    isFeatured: true,
    buttonText: "Get for £5.00",
    icon: Star,
    color: "red",
    description: "Most popular choice",
    token: 1,
    validity: 30
  },
  {
    name: "Traders Silver",
    originalPrice: "£100.00",
    price: "£100.00",
    couponCode: "TRADERSILVER100",
    couponDiscount: "£100.00",
    features: [
      "Up to Five Listings",
      "10 Days Period",
      "Email support"
    ],
    isFeatured: false,
    buttonText: "Get Free Plan",
    icon: TrendingUp,
    color: "blue",
    description: "Great for small traders",
    token: 5,
    validity: 10
  },
  {
    name: "Traders Gold",
    originalPrice: "£250.00",
    price: "£250.00",
    couponCode: "TRADERGOLD200",
    couponDiscount: "£200.00",
    features: [
      "Up to 15 Listings",
      "30 days period",
      "Priority support",
      "Advanced dashboard"
    ],
    isFeatured: true,
    buttonText: "Get for £50.00",
    icon: Crown,
    color: "red",
    description: "For growing businesses",
    token: 15,
    validity: 30
  },
  {
    name: "Traders Platinum",
    originalPrice: "£350.00",
    price: "£350.00",
    couponCode: "TRADERPLATINUM250",
    couponDiscount: "£250.00",
    features: [
      "Up to 30 Listings",
      "30 Days period",
      "24/7 Priority support",
      "Advanced dashboard"
    ],
    isFeatured: true,
    buttonText: "Get for £100.00",
    icon: Zap,
    color: "blue",
    description: "Enterprise solution",
    token: 30,
    validity: 30
  }
]

const getColorClasses = (color: string) => {
  switch (color) {
    case "blue":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-600",
        hover: "hover:border-blue-300",
        button: "bg-blue-600 hover:bg-blue-700"
      }
    case "red":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-600",
        hover: "hover:border-red-300",
        button: "bg-red-600 hover:bg-red-700"
      }
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-600",
        hover: "hover:border-gray-300",
        button: "bg-gray-600 hover:bg-gray-700"
      }
  }
}

export function PaymentPlans() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [hasActivePlan, setHasActivePlan] = useState(false)
  const [checkingPlan, setCheckingPlan] = useState(true)
  const [isUpgradeMode, setIsUpgradeMode] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [planExpiryDate, setPlanExpiryDate] = useState<Date | null>(null)
  const [availableUpgrades, setAvailableUpgrades] = useState<string[]>([])
  const [availableRenewals, setAvailableRenewals] = useState<string[]>([])
  const [userRole, setUserRole] = useState<'user' | 'dealer'>('dealer')
  const { toast } = useToast()

  // Helper function to check if a plan is free
  const isFreePlan = (planName: string) => {
    const plan = plans.find(p => p.name === planName)
    if (!plan) return false
    const originalPrice = parseFloat(plan.originalPrice.replace('£', ''))
    const discount = parseFloat(plan.couponDiscount.replace('£', ''))
    return originalPrice === discount
  }

  // Check if user can access this plan
  const canUserAccessPlan = (planName: string) => {
    if (userRole === 'dealer') return true // Dealers can access all plans
    
    // Users can only access Basic and Private Gold plans
    return planName === 'Basic' || planName === 'Private Gold'
  }

  useEffect(() => {
    // Check if the user has an active plan and load upgrade options
    if (user) {
      // Set user role based on user object
      setUserRole(user.role || 'user')
      checkActivePlan()
    } else {
      setCheckingPlan(false)
    }
  }, [user])

  const checkActivePlan = async () => {
    try {
      setCheckingPlan(true)
      const currentUser = auth.currentUser
      if (!currentUser) {
        return
      }

      const token = await currentUser.getIdToken(false)
      const response = await fetch(`/api/plan-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.planInfo) {
          const planEndDate = new Date(data.planInfo.planEndDate)
          const now = new Date()
          setPlanExpiryDate(planEndDate)
          // Check if plan is active (not expired)
          if (planEndDate > now) {
            setHasActivePlan(true)
            setCurrentPlan(data.planInfo.planName)
            // Automatically enable upgrade mode if user has active plan
            if (!isUpgradeMode) {
              setIsUpgradeMode(true)
            }
            // Load upgrade options
            await loadUpgradeOptions()
          } else {
            setHasActivePlan(false)
          }
        }
      }
    } catch (error) {
      console.error('Error checking plan status:', error)
    } finally {
      setCheckingPlan(false)
    }
  }

  const loadUpgradeOptions = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) return

      const token = await currentUser.getIdToken(false)
      const response = await fetch(`/api/upgrade-plan`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.currentPlan)
        setAvailableUpgrades(data.availableUpgrades || [])
        setAvailableRenewals(data.availableRenewals || [])
      }
    } catch (error) {
      console.error('Error loading upgrade options:', error)
    }
  }

  const handlePlanSelection = async (planName: string) => {
    // Quick authentication check
    if (loading || checkingPlan) {
      toast({
        title: "Please wait",
        description: "Checking authentication status...",
      })
      return
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to select a payment plan",
        variant: "destructive",
      })
      router.push('/signin')
      return
    }

    // Check if it's an upgrade, renewal, or new plan purchase
    const isCurrentPlanSelected = currentPlan === planName;
    const isUpgradeSelected = availableUpgrades.includes(planName);
    const isRenewalSelected = availableRenewals.includes(planName) && !isUpgradeSelected;
    const isCurrentPlanFree = currentPlan ? isFreePlan(currentPlan) : false;
    const isSelectedPlanFree = isFreePlan(planName);

    // For free plan renewals, check if current plan has expired
    if (isCurrentPlanSelected && isCurrentPlanFree && hasActivePlan && planExpiryDate) {
      const now = new Date();
      if (planExpiryDate > now) {
        toast({
          title: "Free plan renewal not available",
          description: `You can renew your free plan only after it expires on ${planExpiryDate.toLocaleDateString()}. You can upgrade to a paid plan anytime.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (isUpgradeMode && currentPlan) {
      // Validate that the selected plan is available for purchase (upgrade or renewal)
      if (!availableRenewals.includes(planName)) {
        toast({
          title: "Invalid selection",
          description: `${planName} is not available from your current ${currentPlan} plan.`,
          variant: "destructive",
        })
        return
      }
    }
    // Note: Removed the restriction for users with active plans - they can now purchase

    setLoadingPlan(planName)
    
    try {
      // Get Firebase ID token (without forcing refresh for better performance)
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }
      
      // Use cached token instead of forcing refresh (much faster)
      const idToken = await currentUser.getIdToken(false)
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          planName,
          isUpgrade: isUpgradeSelected,
          isRenewal: isRenewalSelected,
          currentPlan: currentPlan
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If token is invalid, try once more with fresh token
        if (response.status === 401) {
          const freshToken = await currentUser.getIdToken(true)
          const retryResponse = await fetch('/api/stripe/create-checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${freshToken}`,
            },
            body: JSON.stringify({ 
              planName,
              isUpgrade: isUpgradeSelected,
              isRenewal: isRenewalSelected,
              currentPlan: currentPlan
            }),
          })
          
          const retryData = await retryResponse.json()
          if (!retryResponse.ok) {
            throw new Error(retryData.error || 'Failed to create checkout session')
          }
          
          if (retryData.sessionUrl) {
            window.location.href = retryData.sessionUrl
            return
          }
        }
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Upgrade Mode Header */}
        {hasActivePlan && currentPlan && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Current Plan: {currentPlan}
              </h2>
              <p className="text-gray-600 mb-4">
                {isFreePlan(currentPlan) 
                  ? "You can upgrade to any paid plan anytime. Free plan renewals are available only after expiry."
                  : "You can upgrade to a higher tier plan or purchase additional plans."
                }
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>✓ Seamless transition with zero downtime</span>
                {planExpiryDate && (
                  <span>• Plan expires: {planExpiryDate.toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color)
            const IconComponent = plan.icon
            const isUpgradeEligible = hasActivePlan ? availableUpgrades.includes(plan.name) : true
            const isCurrentPlan = plan.name === currentPlan
            const isRenewalEligible = hasActivePlan ? availableRenewals.includes(plan.name) : true
            const isLowerTierPlan = Boolean(hasActivePlan && currentPlan && !availableRenewals.includes(plan.name))
            const isCurrentPlanFree = currentPlan ? isFreePlan(currentPlan) : false
            const isSelectedPlanFree = isFreePlan(plan.name)
            const isPlanExpired = planExpiryDate ? new Date() > planExpiryDate : false
            const canRenewFreePlan = isCurrentPlan && isSelectedPlanFree && isCurrentPlanFree && isPlanExpired
            const isFreePlanRenewalBlocked = isCurrentPlan && isSelectedPlanFree && isCurrentPlanFree && !isPlanExpired
            const isPlanAccessible = canUserAccessPlan(plan.name)
            
            return (
              <Card
                key={plan.name}
                className={
                  `relative flex flex-col h-full transition-all duration-300 transform border shadow-lg bg-white hover:shadow-xl${
                    hoveredPlan === plan.name ? ' scale-105 shadow-2xl' : ''
                  }${
                    isCurrentPlan ? ' border-blue-300 bg-blue-50' : 
                    isFreePlanRenewalBlocked ? ' border-orange-300 bg-orange-50' :
                    isLowerTierPlan ? ' border-gray-300 bg-gray-50 opacity-75' : 
                    !isPlanAccessible ? ' border-red-300 bg-red-50 opacity-75' :
                    ' border-gray-200'
                  }`
                }
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Plan Status Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-blue-600 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}
                {!isPlanAccessible && userRole === 'user' && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                      Dealer Only
                    </Badge>
                  </div>
                )}
                {isFreePlanRenewalBlocked && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      Available After Expiry
                    </Badge>
                  </div>
                )}
                {isLowerTierPlan && !isCurrentPlan && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="outline" className="bg-gray-200 text-gray-600 border-gray-400">
                      Lower Tier
                    </Badge>
                  </div>
                )}
                {isUpgradeEligible && hasActivePlan && !isCurrentPlan && !isLowerTierPlan && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-green-600 text-white">
                      Upgrade Available
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4 pt-8">
                  {/* Plan Icon */}
                  <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>

                  {/* Price Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="line-through text-gray-400 text-sm">{plan.originalPrice}</span>
                      <span className="text-3xl font-bold text-green-600">
                        {(() => {
                          const calculatedPrice = parseFloat(plan.price.replace('£', '')) - parseFloat(plan.couponDiscount.replace('£', ''));
                          return calculatedPrice === 0 ? 'Free' : `£${calculatedPrice.toFixed(2)}`;
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-medium">
                      ✓ {plan.couponDiscount} discount already applied!
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 px-6">
                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  {!isPlanAccessible ? (
                    <div className="w-full">
                      <div className="w-full py-3 text-center bg-red-50 text-red-700 rounded-lg font-semibold border border-red-200 mb-2">
                        Dealer Account Required
                      </div>
                      <p className="text-xs text-center text-red-600">
                        Upgrade to dealer account to access this plan
                      </p>
                    </div>
                  ) : isFreePlanRenewalBlocked ? (
                    <div className="w-full">
                      <div className="w-full py-3 text-center bg-orange-50 text-orange-700 rounded-lg font-semibold border border-orange-200 mb-2">
                        Available After Expiry
                      </div>
                      <p className="text-xs text-center text-orange-600">
                        Expires: {planExpiryDate?.toLocaleDateString()}
                      </p>
                    </div>
                  ) : isCurrentPlan && !isFreePlanRenewalBlocked ? (
                    <Button 
                      onClick={() => handlePlanSelection(plan.name)}
                      disabled={loadingPlan === plan.name || checkingPlan}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-normal text-center"
                      size="lg"
                    >
                      {loadingPlan === plan.name ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Renew ${plan.name}`
                      )}
                    </Button>
                  ) : isLowerTierPlan && !isCurrentPlan ? (
                    <div className="w-full py-3 text-center bg-gray-100 text-gray-600 rounded-lg font-semibold">
                      Not Available (Lower Tier)
                    </div>
                  ) : (
                    <Button 
                      onClick={() => handlePlanSelection(plan.name)}
                      disabled={loadingPlan === plan.name || checkingPlan || (isLowerTierPlan && !isCurrentPlan)}
                      className={`w-full ${colors.button} text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-normal text-center`}
                      size="lg"
                    >
                      {loadingPlan === plan.name ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (hasActivePlan && isUpgradeEligible && !isCurrentPlan) ? (
                        `Upgrade to ${plan.name}`
                      ) : (
                        plan.buttonText
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Plan Comparison */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Plan Comparison
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className={`text-center py-4 px-4 font-semibold ${
                      !canUserAccessPlan(plan.name) && userRole === 'user' 
                        ? 'text-gray-400' 
                        : 'text-gray-900'
                    }`}>
                      {plan.name}
                      {!canUserAccessPlan(plan.name) && userRole === 'user' && (
                        <span className="block text-xs text-red-500 font-normal">Dealer Only</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Listings</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className={`text-center py-4 px-4 ${
                      !canUserAccessPlan(plan.name) && userRole === 'user' 
                        ? 'text-gray-400' 
                        : 'text-gray-900'
                    }`}>
                      {(() => {
                        if (!canUserAccessPlan(plan.name) && userRole === 'user') {
                          return '—'
                        }
                        
                        const feature = plan.features.find(f => f.includes('Listing'));
                        if (!feature) return '1';

                        if (feature.includes('One')) return '1';
                        if (feature.includes('Five')) return '5';

                        const numberMatch = feature.match(/\d+/);
                        if (numberMatch) return numberMatch[0];
                        
                        return '1';
                      })()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Duration</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className={`text-center py-4 px-4 ${
                      !canUserAccessPlan(plan.name) && userRole === 'user' 
                        ? 'text-gray-400' 
                        : 'text-gray-900'
                    }`}>
                      {(() => {
                        if (!canUserAccessPlan(plan.name) && userRole === 'user') {
                          return '—'
                        }
                        return plan.features.find(f => f.includes('days') || f.includes('Days'))?.split(' ')[0] || '7 days'
                      })()}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}