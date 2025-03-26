import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CarListings } from "@/components/car-listings"
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

const categories = [
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

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        <Hero />
        <CategoryGrid categories={categories} />
        <RegistrationSteps />
        <CarListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        <LeaseCarListings />
        <BrowseByBrand />
        <ValueYourCarBanner />
        <BlogPostsSection />
        
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

