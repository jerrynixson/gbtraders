"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TruckListings } from "@/components/categories/trucks/truck-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { CategoryGrid } from "@/components/category-grid"
import { RegistrationSteps } from "@/components/registration-steps"
import { AdvertiseWithUs } from "@/components/Advertise-with-us"
import { LeaseTruckListings } from "@/components/categories/trucks/lease-truck"
import { BrowseByBrand } from "@/components/browse-by-brand"
import { ValueYourCarBanner } from "@/components/value-car"
import { BackToTop } from "@/components/back-to-top"
import CarRentalBanner from "@/components/dealer-advert-banner"
import BlogPostsSection from "@/components/blog-post-section"

export default function TrucksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        <Hero />
        <TruckListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        {/* <LeaseTruckListings /> */}
        {/*<BlogPostsSection />*/}
        <BrowseByBrand />
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
} 