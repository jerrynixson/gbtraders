import { Fuel, Gauge, CarFront, Settings, Users, CreditCard, ShieldCheck, Info } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Vehicle Summary */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Vehicle Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 p-3 rounded-lg">
              <Gauge className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{mileage.toLocaleString()} Miles</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <Fuel className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{fuelType}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{engineSize} litre</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{seats} Seats</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <CarFront className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{doors} Door {bodyType}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{gearbox}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Running Costs */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Running Costs</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xl font-bold text-primary">{mpg}</p>
              <p className="text-sm font-medium">MPG</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xl font-bold text-primary">£{costToFill}</p>
              <p className="text-sm font-medium">Cost to fill</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xl font-bold text-primary">{range}</p>
              <p className="text-sm font-medium">Range (miles)</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <ShieldCheck className={cn(
                "h-6 w-6 mx-auto mb-2",
                ulezCompliant ? "text-green-500" : "text-muted-foreground"
              )} />
              <p className="text-sm font-medium">{ulezCompliant ? "ULEZ Compliant" : "Not ULEZ"}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xl font-bold text-primary">{insuranceGroup}</p>
              <p className="text-sm font-medium">Insurance Group</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xl font-bold text-primary">£{vehicleTax}</p>
              <p className="text-sm font-medium">Vehicle Tax</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
