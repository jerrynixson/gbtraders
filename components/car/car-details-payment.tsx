import Image from "next/image"
import { MessageCircle, Phone } from "lucide-react"
import { ReactNode } from "react"

interface CarDetailsPaymentProps {
  carName: string
  carDescription: string
  price: string
  dealerName: string
  dealerLocation: string
  saveButton?: ReactNode
  makeOfferButton?: ReactNode
}

export function CarDetailsPayment({
  carName,
  carDescription,
  price,
  dealerName,
  dealerLocation,
  saveButton,
  makeOfferButton,
}: CarDetailsPaymentProps) {
  return (
    <div className="top-4">
      <div className="bg-background border border-border rounded-md p-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">{carName}</h1>
          {saveButton && <div>{saveButton}</div>}
        </div>
        <p className="text-sm text-muted-foreground mb-4">{carDescription}</p>
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
            <div className="text-xl font-bold">{price}</div>
            {makeOfferButton && (
              <div className="mt-4">{makeOfferButton}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

