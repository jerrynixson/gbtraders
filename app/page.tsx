import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CarListings } from "@/components/car-listings"
import { SellYourCar } from "@/components/sell-your-car"
import { BuyingEssentials } from "@/components/buying-essentials"
import { Footer } from "@/components/footer"
import { Footer2 } from "@/components/footer2"
import { CategoryGrid } from "@/components/category-grid"

const categories = [
  {
    title: "Car",
    href: "/cars",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vM5gDEZhWCrGCRrrWuAfYKS81l6Ki1.png#car",
  },
  {
    title: "Breakdown Services",
    href: "/breakdown-services",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vM5gDEZhWCrGCRrrWuAfYKS81l6Ki1.png#breakdown",
  },
  {
    title: "Car Parts",
    href: "/car-parts",
  },
  {
    title: "Garages",
    href: "/garages",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vM5gDEZhWCrGCRrrWuAfYKS81l6Ki1.png#garages",
  },
  {
    title: "Vans",
    href: "/vans",
  },
  {
    title: "Dealers",
    href: "/dealers",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <CarListings />
        <CategoryGrid categories={categories} />
        <SellYourCar />
        <BuyingEssentials />
      </main>
      <Footer2 />
    </div>
  )
}

