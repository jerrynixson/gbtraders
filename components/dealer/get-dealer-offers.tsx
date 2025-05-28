"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GetDealerOffers() {
  const [registration, setRegistration] = useState("")
  const [mileage, setMileage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect or show results
    setIsSubmitting(false)
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Get dealer offers</h2>
            <p className="text-gray-600 mb-6">
              We'll give you an estimate of how much your car could be worth to a buyer. Then we'll hand you over to our
              online partner Dealer Auction to let the bidding begin!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="registration" className="block text-sm font-medium">
                  Your vehicle registration
                </label>
                <Input
                  id="registration"
                  value={registration}
                  onChange={(e) => setRegistration(e.target.value)}
                  placeholder="e.g. AB12CDE"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mileage" className="block text-sm font-medium">
                  Your current mileage
                </label>
                <Input
                  id="mileage"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? "Finding your car..." : "Find my car"}
              </Button>
            </form>
          </div>

          <div className="rounded-lg overflow-hidden">
            <Image
              src="/car-audi.jpeg?height=500&width=600"
              alt="Woman checking phone for car offers"
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

