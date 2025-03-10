import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CarListings } from "@/components/car-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <CarListings />
        <SellYourCar />
        <BuyingEssentials />
      </main>
      <Footer />
    </div>
  )
}

