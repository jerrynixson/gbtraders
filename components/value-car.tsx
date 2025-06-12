import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValueYourCarBannerProps extends React.HTMLAttributes<HTMLElement> {}

export const ValueYourCarBanner = ({ className, ...props }: ValueYourCarBannerProps) => {
  return (
    <section className={cn("max-w-[85rem] mx-auto bg-gradient-to-r from-red-800 to-blue-900 text-white py-12 rounded-2xl overflow-hidden shadow-xl", className)} {...props}>
      <div className="mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          {/* Text Content */}
          <div className="space-y-4 bg-white/10 backdrop-blur-md p-8 rounded-xl">
            <h2 className="text-3xl font-bold">
              Value Your Car
            </h2>
            <p className="text-lg text-white/90">
              Join GB Trader and get an instant, free valuation for your car. 
              Discover its true market worth quickly and easily.
            </p>
            <Button 
              className="group bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all rounded-full px-6 py-3 font-semibold"
            >
              Get Valuation
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-[10px_0px_20px_rgba(0,0,0,0.4)]">
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