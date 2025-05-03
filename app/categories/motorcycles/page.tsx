"use client"

import { Header } from "@/components/header"
import { Hero } from "../../../components/categories/motorcycles/hero"
import { MotorcycleListings } from "../../../components/categories/motorcycles/motorcycle-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { CategoryGrid } from "@/components/category-grid"
import { RegistrationSteps } from "@/components/registration-steps"
import { AdvertiseWithUs } from "@/components/Advertise-with-us"
import { LeaseMotorcycleListings } from "../../../components/categories/motorcycles/lease-motorcycle"
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
    href: "/breakdown-services",
    image: "/breakdown.png",
  },
  {
    title: "Car Parts",
    href: "/car-parts",
    image: "/car-parts.jpg",
  },
  {
    title: "Garages",
    href: "/garages",
    image: "garages.jpg",
  },
  {
    title: "Dealers",
    href: "/dealers",
    image: "/dealers.jpg",
  },
]

export default function MotorcyclesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        <Hero />
        <MotorcycleListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        <LeaseMotorcycleListings />
        <BlogPostsSection />
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
} 