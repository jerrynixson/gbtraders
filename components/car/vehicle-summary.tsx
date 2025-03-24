import { Fuel, Gauge, CarFront, Settings, Users, CreditCard, ShieldCheck, Info } from "lucide-react"
import Image from "next/image"

interface VehicleDetailsProps {
  specifications: {
    fuelType: string
    bodyType: string
    gearbox: string
    doors: number
    seats: number
    mileage: number
    engineSize: string
  }
  runningCosts: {
    mpg: number
    costToFill: number
    range: number
    ulezCompliant: boolean
    insuranceGroup: number
    vehicleTax: number
  }
}

export function VehicleDetails({ specifications, runningCosts }: VehicleDetailsProps) {
  const { fuelType, bodyType, gearbox, doors, seats, mileage, engineSize } = specifications
  const { mpg, costToFill, range, ulezCompliant, insuranceGroup, vehicleTax } = runningCosts

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
      {/* Vehicle Summary */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Vehicle Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Gauge className="h-6 w-6 mx-auto" />
            <p className="text-sm">{mileage.toLocaleString()} Miles</p>
          </div>
          <div>
            <Fuel className="h-6 w-6 mx-auto" />
            <p className="text-sm">{fuelType}</p>
          </div>
          <div>
            <Settings className="h-6 w-6 mx-auto" />
            <p className="text-sm">{engineSize} litre</p>
          </div>
          <div>
            <Users className="h-6 w-6 mx-auto" />
            <p className="text-sm">{seats} Seats</p>
          </div>
          <div>
            <CarFront className="h-6 w-6 mx-auto" />
            <p className="text-sm">{doors} Door {bodyType}</p>
          </div>
          <div>
            <Settings className="h-6 w-6 mx-auto" />
            <p className="text-sm">{gearbox}</p>
          </div>
        </div>
      </div>

      {/* Running Costs */}
      <div className="p-4 border rounded-lg relative">
        <h2 className="text-lg font-semibold mb-4">Running Costs</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold">{mpg}</p>
            <p className="text-sm">MPG</p>
          </div>
          <div>
            <p className="text-xl font-bold">£{costToFill}</p>
            <p className="text-sm">Cost to fill</p>
          </div>
          <div>
            <p className="text-xl font-bold">{range}</p>
            <p className="text-sm">Range (miles)</p>
          </div>
          <div>
            <ShieldCheck className={`h-6 w-6 mx-auto ${ulezCompliant ? "text-green-500" : "text-gray-400"}`} />
            <p className="text-sm">{ulezCompliant ? "ULEZ Compliant" : "Not ULEZ"}</p>
          </div>
          <div>
            <p className="text-xl font-bold">{insuranceGroup}</p>
            <p className="text-sm">Insurance Group</p>
          </div>
          <div>
            <p className="text-xl font-bold">£{vehicleTax}</p>
            <p className="text-sm">Vehicle Tax</p>
          </div>
        </div>
        <Info className="absolute top-4 right-4 h-5 w-5 cursor-pointer" />
      </div>
    </div>
  )
}
