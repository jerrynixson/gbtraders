import { Button } from "@/components/ui/button"
import Link from "next/link"

export function SellYourCar() {
  return (
    <section className="bg-destructive py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <p className="text-white mb-2">Have a vehicle you are trying to sell?</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Be a verified seller and reach
              <br />
              thousands of potential buyers
              <br />
              effortlessly!
            </h2>
            <p className="text-white text-sm mt-4">
              List your car today and get the best deals—fast, secure, and hassle-free!
            </p>
          </div>
          <div>
            <Link href="/sell/find-car">
              <Button className="bg-white text-destructive hover:bg-white/90 font-semibold text-lg px-8 py-6 rounded-full">
                Get Started!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

