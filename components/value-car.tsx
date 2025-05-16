import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export const ValueYourCarBanner = () => {
  return (
    <section className="bg-gradient-to-r from-blue-800 to-red-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
          {/* Text Content */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              Value Your Car
            </h2>
            <p className="text-base text-white/90">
              Join GB Trader and get an instant, free valuation for your car. 
              Discover its true market worth quickly and easily.
            </p>
            <Button 
              variant="secondary" 
              className="group bg-white text-blue-700 hover:bg-gray-100 transition-all"
            >
              Get Valuation
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden">
            <Image 
              src="/dealers.jpg" 
              alt="Car Valuation" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}