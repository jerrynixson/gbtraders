import { Header } from "@/components/header"
import { Hero } from "@/components/categories/garages/hero"
import { CarListings } from "@/components/categories/garages/garage-listing"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { CategoryGrid } from "@/components/category-grid"
import { RegistrationSteps } from "@/components/registration-steps"
import { AdvertiseWithUs } from "@/components/Advertise-with-us"
import { LeaseCarListings } from "@/components/lease-car-listings"
import { BrowseByBrand } from "@/components/browse-by-brand"
import { ValueYourCarBanner } from "@/components/value-car"
import { BackToTop } from "@/components/back-to-top"
import CarRentalBanner from "@/components/dealer-advert-banner"
import BlogPostsSection from "@/components/blog-post-section"



export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        <Hero />
        <CarListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        <ValueYourCarBanner />
        <BlogPostsSection />
        
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

