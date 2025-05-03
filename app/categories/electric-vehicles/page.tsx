"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/categories/electric-vehicles/hero"
import { ElectricVehicleListings } from "@/components/categories/electric-vehicles/electric-vehicle-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { CategoryGrid } from "@/components/category-grid"
import { RegistrationSteps } from "@/components/registration-steps"
import { AdvertiseWithUs } from "@/components/Advertise-with-us"
import { LeaseElectricVehicleListings } from "@/components/categories/electric-vehicles/lease-electric-vehicle"
import { BrowseByBrand } from "@/components/browse-by-brand"
import { ValueYourCarBanner } from "@/components/value-car"
import { BackToTop } from "@/components/back-to-top"
import CarRentalBanner from "@/components/dealer-advert-banner"
import BlogPostsSection from "@/components/blog-post-section"

export default function ElectricVehiclesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        <Hero />
        <ElectricVehicleListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        <LeaseElectricVehicleListings />
        <BlogPostsSection />
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
} 