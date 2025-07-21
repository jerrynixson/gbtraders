"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PaymentPlans } from "@/components/payment-plans"
import { BackToTop } from "@/components/back-to-top"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Shield, Clock, Users, Zap, CheckCircle } from "lucide-react"
import { ContactSupportModal } from "@/components/contact-support-modal"
import { useState } from "react"

export default function PaymentPlansPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-blue-50 to-red-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-blue-600 to-red-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Unlock the full potential of car trading with our flexible pricing plans. 
              Start free and scale as you grow.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure & Reliable</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-400/20 rounded-full blur-xl"></div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Plans Section */}
        <PaymentPlans />
        
        {/* Features Comparison */}
        <section className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose GB Traders?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful car traders who trust our platform for their business
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600">
                Get your listings live in minutes with our streamlined process
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Verified Quality</h3>
              <p className="text-gray-600">
                All listings are verified to ensure quality and trust
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Platform</h3>
              <p className="text-gray-600">
                Bank-level security to protect your data and transactions
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 bg-gradient-to-r from-red-600 to-blue-600 rounded-3xl p-12 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful traders and start your journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white bg-transparent hover:bg-white hover:text-blue-600"
                onClick={() => setIsContactModalOpen(true)}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing plans
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I upgrade my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade your plan at any time. The new features will be available immediately.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens when my listing expires?
              </h3>
              <p className="text-gray-600">
                You'll receive a notification before expiration. You can renew or upgrade to keep your listing active.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a money-back guarantee?
              </h3>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee on all paid plans if you're not satisfied.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer custom enterprise plans?
              </h3>
              <p className="text-gray-600">
                Yes! Contact our sales team for custom enterprise solutions tailored to your needs.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <BackToTop />
      <Footer />

      {/* Contact Support Modal */}
      <ContactSupportModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  )
} 