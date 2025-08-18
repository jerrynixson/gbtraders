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
import { GBTraderFeatures } from "@/components/gbtrader-features"
import { AnimatedSection } from "@/components/animated-section"
import Link from "next/link"

const categories = [
  {
    title: "Vehicles",
    href: "/categories/vehicles",
    image: "/car.webp",
  },
  {
    title: "Dealers",
    href: "/dealers",
    image: "/dealers.webp",
  },
  {
    title: "Breakdown Services",
    href: "/coming-soon",
    image: "/breakdown.webp",
  },
  {
    title: "Shop",
    href: "/coming-soon",
    image: "/car-parts.webp",
  },
  {
    title: "Garages",
    href: "/categories/garages",
    image: "/garages.webp",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="space-y-5">
        <Hero />
        <AnimatedSection>
          <CategoryGrid categories={categories} />
        </AnimatedSection>
        
        {/*<AnimatedSection>
          <ValueYourCarBanner className="mt-5" />
        </AnimatedSection>*/}

        <AnimatedSection>
          <RegistrationSteps />
        </AnimatedSection>

        <AnimatedSection>
          <CarRentalBanner />
        </AnimatedSection>

        <AnimatedSection>
          <AdvertiseWithUs />
        </AnimatedSection>

        <AnimatedSection>
          <BrowseByBrand />
        </AnimatedSection>

        <AnimatedSection>
          <GBTraderFeatures />
        </AnimatedSection>

        {/*
        <AnimatedSection>
          <BlogPostsSection />
        </AnimatedSection>
        */}
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

