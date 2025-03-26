import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export const ValueYourCarBanner = () => {
  return (
    <section className="bg-gradient-to-r from-blue-800 to-red-800 text-white py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        {/* Text Content */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Value Your Car</h2>
          <p className="text-lg opacity-90">
            Join GB Trader and get an instant, free valuation for your car. Discover its true market worth quickly and easily.
          </p>
          <Button 
            variant="secondary" 
            className="bg-white text-blue-700 hover:bg-gray-100 transition-colors"
          >
            Get Valuation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Image */}
        <div className="w-full h-full">
          <Image 
            src="/dealers.jpg" 
            alt="Car Valuation" 
            width={600}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}