"use client"

import { Header } from "@/components/header"
import { Hero } from "../../../components/categories/caravans/hero"
import { CaravanListings } from "../../../components/categories/caravans/caravan-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { CategoryGrid } from "@/components/category-grid"
import { RegistrationSteps } from "@/components/registration-steps"
import { AdvertiseWithUs } from "@/components/Advertise-with-us"
import { LeaseCaravanListings } from "../../../components/categories/caravans/lease-caravan"
import { BrowseByBrand } from "@/components/browse-by-brand"
import { ValueYourCarBanner } from "@/components/value-car"
import { BackToTop } from "@/components/back-to-top"
import CarRentalBanner from "@/components/dealer-advert-banner"
import BlogPostsSection from "@/components/blog-post-section"

interface Category {
  title: string
  href: string
  image: string
}

const categories: Category[] = [
  {
    title: "Vehicles",
    href: "/cars",
    image: "/car.jpg",
  },
  {
    title: "Breakdown Services",
    href: "/coming-soon",
    image: "/breakdown.png",
  },
]

export default function CaravansPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="space-y-5">
        <Hero />
        <CaravanListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        <LeaseCaravanListings />
        <BlogPostsSection />
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
} 