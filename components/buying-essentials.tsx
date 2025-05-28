import type React from "react"
import { Calculator, Car, FileText, Shield } from "lucide-react"

type EssentialCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function EssentialCard({ icon, title, description }: EssentialCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 p-4 border rounded-md">{icon}</div>
      <h3 className="font-semibold uppercase mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

export function BuyingEssentials() {
  const essentials = [
    {
      icon: <Calculator className="h-12 w-12 text-gray-700" />,
      title: "Car Finance & Loans",
      description: "Discover how much you can borrow and find the right package for you.",
    },
    {
      icon: <FileText className="h-12 w-12 text-gray-700" />,
      title: "Check a Car's History",
      description: "Have complete peace of mind before you buy your next car.",
    },
    {
      icon: <Shield className="h-12 w-12 text-gray-700" />,
      title: "Security Advice",
      description: "Advice on how to buy and sell vehicles safely.",
    },
    {
      icon: <Car className="h-12 w-12 text-gray-700" />,
      title: "What's it Worth",
      description: "Get a free valuation. Sell or part-exchange your car at the right price.",
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-semibold text-center mb-12">Buying essentials</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {essentials.map((essential, index) => (
            <EssentialCard key={index} {...essential} />
          ))}
        </div>
      </div>
    </section>
  )
}

