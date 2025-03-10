interface VehicleSummaryProps {
  specifications: {
    fuelType: string
    bodyType: string
    gearbox: string
    doors: number
    seats: number
  }
}

export function VehicleSummary({ specifications }: VehicleSummaryProps) {
  const { fuelType, bodyType, gearbox, doors, seats } = specifications

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Vehicle summary</h2>
      <div className="grid grid-cols-2 gap-y-3 border-t border-border py-3">
        <div className="text-sm text-muted-foreground">Fuel type</div>
        <div className="text-sm">{fuelType}</div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 border-t border-border py-3">
        <div className="text-sm text-muted-foreground">Bodytype</div>
        <div className="text-sm">{bodyType}</div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 border-t border-border py-3">
        <div className="text-sm text-muted-foreground">Gearbox</div>
        <div className="text-sm">{gearbox}</div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 border-t border-border py-3">
        <div className="text-sm text-muted-foreground">Doors</div>
        <div className="text-sm">{doors}</div>
      </div>
      <div className="grid grid-cols-2 gap-y-3 border-t border-border border-b py-3">
        <div className="text-sm text-muted-foreground">Seats</div>
        <div className="text-sm">{seats}</div>
      </div>
      <button className="mt-4 text-sm text-primary border border-primary rounded-full py-2 px-6">
        View all features and spec
      </button>
    </div>
  )
}

