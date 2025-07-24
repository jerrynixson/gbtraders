import { Header } from "@/components/header"
//import { Hero } from "@/components/categories/vans/hero"
import { Hero } from "@/components/hero"
import { VanListings } from "@/components/categories/vans/van-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { CategoryGrid } from "@/components/category-grid"
import { RegistrationSteps } from "@/components/registration-steps"
import { AdvertiseWithUs } from "@/components/Advertise-with-us"
import { LeaseVanListings } from "@/components/categories/vans/lease-van"
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
    href: "/coming-soon",
    image: "/breakdown.png",
  },
  {
    title: "Car Parts",
    href: "/coming-soon",
    image: "/car-parts.jpg",
  },
  {
    title: "Garages",
    href: "/coming-soon",
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
        <VanListings />
        <CarRentalBanner />
        <AdvertiseWithUs />
        {/* <LeaseVanListings /> */}
        {/*<BlogPostsSection />*/}
        <BrowseByBrand />
        
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

