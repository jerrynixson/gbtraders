"use client"

import { useState } from "react"
import { Check, Star, Zap, Crown, TrendingUp, Shield } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const plans = [
  {
    name: "Basic",
    originalPrice: "£25.00",
    price: "£0.00",
    image: "/images/basic-package.jpg",
    features: [
      "One Free Listing",
      "7 days Listing period",
      "Renew for free",
      "Basic support"
    ],
    isFeatured: false,
    buttonText: "Start Free",
    isFree: true,
    icon: Shield,
    color: "blue",
    description: "Perfect for getting started"
  },
  {
    name: "Private Gold",
    originalPrice: "£25.00",
    price: "£5.00",
    features: [
      "One Listing",
      "30 Days Listing period",
      "Listings featured",
      "Priority support",
      "Analytics dashboard"
    ],
    isFeatured: true,
    buttonText: "Get Started",
    icon: Star,
    color: "red",
    description: "Most popular choice"
  },
  {
    name: "Traders Silver",
    originalPrice: "£100.00",
    price: "£0.00",
    features: [
      "Up to Five Listings",
      "10 Days Period",
      "Featured listings",
      "Advanced analytics",
      "Email support"
    ],
    isFeatured: false,
    buttonText: "Start Free",
    isFree: true,
    icon: TrendingUp,
    color: "blue",
    description: "Great for small traders"
  },
  {
    name: "Traders Gold",
    originalPrice: "£250.00",
    price: "£50.00",
    features: [
      "Up to 15 Listings",
      "30 days period",
      "Listings featured",
      "Priority support",
      "Advanced analytics",
      "Custom branding"
    ],
    isFeatured: true,
    buttonText: "Get Started",
    icon: Crown,
    color: "red",
    description: "For growing businesses"
  },
  {
    name: "Traders Platinum",
    originalPrice: "£350.00",
    price: "£100.00",
    features: [
      "Up to 30 Listings",
      "30 Days period",
      "Listings featured",
      "24/7 Priority support",
      "Advanced analytics",
      "Custom branding",
      "API access"
    ],
    isFeatured: true,
    buttonText: "Get Started",
    icon: Zap,
    color: "blue",
    description: "Enterprise solution"
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
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  return (
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan) => {
            const colors = getColorClasses(plan.color)
            const IconComponent = plan.icon
            
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col h-full transition-all duration-300 transform ${
                  plan.isFeatured 
                    ? 'border-2 border-red-400 shadow-xl scale-105' 
                    : 'border border-gray-200 shadow-lg'
                } ${
                  hoveredPlan === plan.name ? 'scale-105 shadow-2xl' : ''
                } bg-white hover:shadow-xl`}
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Featured Badge */}
                {plan.isFeatured && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
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
                      {plan.isFree ? (
                        <span className="text-3xl font-bold text-green-600">Free</span>
                      ) : (
                        <>
                          <span className="line-through text-gray-400 text-sm">{plan.originalPrice}</span>
                          <span className="text-3xl font-bold text-green-600">{plan.price}</span>
                        </>
                      )}
                    </div>
                    {!plan.isFree && (
                      <p className="text-xs text-gray-500">Save {Math.round(((parseFloat(plan.originalPrice.replace('£', '')) - parseFloat(plan.price.replace('£', ''))) / parseFloat(plan.originalPrice.replace('£', ''))) * 100)}%</p>
                    )}
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
                  <Button 
                    className={`w-full ${colors.button} text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
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
                    <th key={plan.name} className="text-center py-4 px-4 font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Listings</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.features.find(f => f.includes('Listing'))?.split(' ')[0] || '1'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Duration</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.features.find(f => f.includes('days') || f.includes('Days'))?.split(' ')[0] || '7 days'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Featured</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.features.some(f => f.includes('featured')) ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Support</td>
                  {plans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.features.find(f => f.includes('support'))?.split(' ')[0] || 'Basic'}
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