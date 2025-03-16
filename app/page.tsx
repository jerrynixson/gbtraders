import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CarListings } from "@/components/car-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { CategoryGrid } from "@/components/category-grid"
import { RegistrationSteps } from "@/components/registration-steps"
import { BackToTop } from "@/components/back-to-top"

const categories = [
  {
    title: "Car",
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
    title: "Vans",
    href: "/vans",
    image: "/vans.jpg",
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
      <main className="space-y-10">
        <Hero />
        <CarListings />
        <CategoryGrid categories={categories} />
        <RegistrationSteps />
        
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

