import Image from "next/image"
import { MessageCircle, Phone } from "lucide-react"

interface CarDetailsPaymentProps {
  carName: string
  carDescription: string
  price: string
  initialPayment: string
  monthlyPayments: number
  dealerName: string
  dealerLocation: string
}

export function CarDetailsPayment({
  carName,
  carDescription,
  price,
  initialPayment,
  monthlyPayments,
  dealerName,
  dealerLocation,
}: CarDetailsPaymentProps) {
  return (
    <div className="sticky top-4">
      <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-t-md inline-block">
        Personal
      </div>
      <div className="bg-background border border-border rounded-md p-4 mb-6">
        <h1 className="text-xl font-bold mb-1">{carName}</h1>
        <p className="text-sm text-muted-foreground mb-4">{carDescription}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button className="bg-primary text-primary-foreground text-sm font-semibold py-2 px-4 rounded-md">
            Start application
          </button>
          <button className="border border-primary text-primary text-sm font-semibold py-2 px-4 rounded-md">
            Contact us
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground">PRICE</div>
            <div className="text-xl font-bold">{price}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">INITIAL PAYMENT</div>
            <div className="text-sm">{initialPayment} (inc VAT)</div>
            <div className="text-xs text-muted-foreground">{monthlyPayments}x monthly payments</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Customize your payment</h3>
          <p className="text-xs text-muted-foreground mb-4">What's your preferred annual mileage?</p>

          <div className="mb-6">
            <label className="text-xs text-muted-foreground mb-1 block">Select your deposit</label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="10"
                defaultValue="3"
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>£0</span>
                <span>£3,000</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs text-muted-foreground mb-1 block">
              How long would you like the car for? (in months)
            </label>
            <div className="relative">
              <input
                type="range"
                min="24"
                max="48"
                defaultValue="36"
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>24</span>
                <span>48</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs text-muted-foreground mb-1 block">How much would you like to pay upfront?</label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {[3, 6, 9, 12].map((month) => (
                <button
                  key={month}
                  className={`text-xs border ${month === 3 ? "border-primary text-primary" : "border-border text-muted-foreground"} rounded-md py-1 px-2`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>

          <a href="#" className="text-xs text-primary">
            Need to reset monthly price?
          </a>
        </div>
      </div>
    </div>
  )
}

