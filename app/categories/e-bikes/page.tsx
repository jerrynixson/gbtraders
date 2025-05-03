"use client";

import { Header } from "@/components/header"
import { Hero } from "@/components/categories/e-bikes/hero"
import { EBikeListings } from "@/components/categories/e-bikes/e-bike-listings"
import { LeaseEBikeListings } from "@/components/categories/e-bikes/lease-e-bike"
import { AdvertiseWithUs } from "@/components/Advertise-with-us"
import { BackToTop } from "@/components/back-to-top"
import { Footer } from "@/components/footer"
import CarRentalBanner from "@/components/dealer-advert-banner"


export default function EBikesPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="space-y-5">
        <Hero />
        <EBikeListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        <LeaseEBikeListings />
        <AdvertiseWithUs />
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
} 