"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DealerProfileSection } from "@/components/dealer/profile"

export default function DealerSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Dealer Profile Setup</h1>
        <DealerProfileSection />
      </main>
      <Footer />
    </div>
  )
}
