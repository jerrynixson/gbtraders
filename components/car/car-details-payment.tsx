import Image from "next/image"
import { MessageCircle, Phone } from "lucide-react"
import { ReactNode } from "react"
import { VehicleSpecsBar } from "@/components/vehicle/vehicle-specs-bar"

interface CarDetailsPaymentProps {
  carName: string
  title: string
  price: string
  dealerName: string
  dealerLocation: string
  saveButton?: ReactNode
  makeOfferButton?: ReactNode
  vehicleSpecs?: {
    engineSize: string
    mileage: number
    fuelType: string
    transmission: string
  }
}

export function CarDetailsPayment({
  carName,
  title,
  price,
  dealerName,
  dealerLocation,
  saveButton,
  makeOfferButton,
  vehicleSpecs,
}: CarDetailsPaymentProps) {
  return (
    <div className="top-4">
      <div className="bg-background border border-border rounded-md p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">{carName}</h1>
          {saveButton && <div>{saveButton}</div>}
        </div>
  <p className="text-sm text-muted-foreground mb-4">{title}</p>
        <div className="hidden grid grid-cols-2 gap-4 mb-4">
          <button className="bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-md">
            Make Offer
          </button>
          <button className="border border-primary text-primary text-sm font-semibold py-2 px-4 rounded-md">
            Contact us
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground">PRICE</div>
            <div className="flex flex-row items-center gap-2 sm:gap-4">
              <div className="text-xl sm:text-2xl font-bold whitespace-nowrap">{price}</div>
              {vehicleSpecs && (
                <div className="flex-1 min-w-0">
                  <VehicleSpecsBar
                    engineSize={vehicleSpecs.engineSize}
                    mileage={vehicleSpecs.mileage}
                    fuelType={vehicleSpecs.fuelType}
                    gearbox={vehicleSpecs.transmission}
                  />
                </div>
              )}
            </div>
            {makeOfferButton && (
              <div className="mt-4">{makeOfferButton}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

