"use client"

import { Header } from "@/components/sell/header"
import { FindCarForm } from "@/components/sell/find-car-form"
import { BackToTop } from "@/components/back-to-top"
import { TrustpilotRating } from "@/components/sell/trustpilot-rating"
import { FeedbackSection } from "@/components/sell/feedback-section"

export default function FindCar() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Header showSignIn={true} />

        {/* Main Content */}
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Find your car</h1>

          <FindCarForm />
          <BackToTop />
          <TrustpilotRating />
          <FeedbackSection />
        </div>
      </div>
    </div>
  )
}

