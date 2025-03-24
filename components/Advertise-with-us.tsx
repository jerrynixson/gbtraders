import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AdvertiseWithUs() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-800 to-red-800 py-16">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-white rotate-12 transform -translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-white -rotate-12 transform translate-x-1/2 -translate-y-1/4"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 md:mr-8 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Reach <span className="text-yellow-300">Thousands</span> of Potential Customers
            </h2>
            <p className="text-lg text-white/90 max-w-xl">
              Get your business in front of our vast automotive community. 
              With over thousands of monthly visitors, GB Trader is your gateway to the UK's most engaged car buyers.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Button
              asChild
              className="bg-white text-blue-600 hover:bg-yellow-300 hover:text-blue-700 font-bold text-lg px-8 py-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Link href="/advertise">
                Advertise With Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-4 text-white/80 text-sm">
              Join 800+ businesses already advertising with us
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}