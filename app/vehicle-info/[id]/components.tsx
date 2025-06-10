import { memo } from 'react'
import { Vehicle, Car as CarType, UsedCar, Van as VanType, Truck as TruckType, VehicleType } from "@/types/vehicles"
import { Car, Truck } from "lucide-react"

// Common styles and layout components
const Card = memo(({ children, title }: { children: React.ReactNode; title: string }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 mt-4 shadow-sm">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </div>
))

const DetailGrid = memo(({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 gap-4">{children}</div>
))

const DetailItem = memo(({ label, value }: { label: string; value: string | number }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
))

// Helper function to render vehicle-specific details
export const VehicleSpecificDetails = memo(({ vehicle }: { vehicle: Vehicle }) => {
  const renderCarDetails = (car: CarType | UsedCar) => {
    const usedCar = vehicle.type === 'used-car' ? vehicle as UsedCar : null;
    return (
      <Card title="Car Specifications">
        <DetailGrid>
          <DetailItem label="Body Style" value={car.bodyStyle} />
          <DetailItem label="Doors" value={car.doors} />
          <DetailItem label="Seats" value={car.seats} />
          <DetailItem label="Engine Size" value={`${car.engineSize}L`} />
          {car.safetyRating && (
            <DetailItem label="Safety Rating" value={`${car.safetyRating}/5`} />
          )}
          {usedCar && (
            <>
              <DetailItem label="Previous Owners" value={usedCar.previousOwners} />
              <DetailItem label="Service History" value={usedCar.serviceHistory ? 'Available' : 'Not Available'} />
              {usedCar.mot && (
                <div className="col-span-2">
                  <DetailItem 
                    label="MOT Expiry" 
                    value={new Date(usedCar.mot.expiryDate).toLocaleDateString()} 
                  />
                  {usedCar.mot.advisories.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Advisories:</p>
                      <ul className="list-disc list-inside">
                        {usedCar.mot.advisories.map((advisory: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600">{advisory}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </DetailGrid>
      </Card>
    );
  };

  const renderVanDetails = (van: VanType) => (
    <Card title="Van Specifications">
      <DetailGrid>
        <DetailItem label="Body Type" value={van.bodyType} />
        <DetailItem label="Load Volume" value={`${van.loadVolume}m³`} />
        <DetailItem label="Load Length" value={`${van.loadLength}m`} />
        <DetailItem label="Roof Height" value={`${van.roofHeight}m`} />
        <DetailItem label="Wheelbase" value={`${van.wheelbase}m`} />
        <DetailItem label="Payload" value={`${van.payload}kg`} />
        <DetailItem label="Gross Weight" value={`${van.grossWeight}kg`} />
        <DetailItem label="Doors" value={van.doors} />
      </DetailGrid>
    </Card>
  );

  const renderTruckDetails = (truck: TruckType) => (
    <Card title="Truck Specifications">
      <DetailGrid>
        <DetailItem label="Body Type" value={truck.bodyType} />
        <DetailItem label="Cab Type" value={truck.cabType} />
        <DetailItem label="Axles" value={truck.axles} />
        <DetailItem label="Max Payload" value={`${truck.maxPayload}kg`} />
        <DetailItem label="Gross Weight" value={`${truck.grossWeight}kg`} />
        <DetailItem label="Transmission" value={truck.transmission} />
      </DetailGrid>
    </Card>
  );

  switch (vehicle.type) {
    case 'car':
    case 'used-car':
      return renderCarDetails(vehicle as CarType | UsedCar);
    case 'van':
      return renderVanDetails(vehicle as VanType);
    case 'truck':
      return renderTruckDetails(vehicle as TruckType);
    default:
      return null;
  }
});

// Helper function to render common vehicle details
export const CommonVehicleDetails = memo(({ vehicle }: { vehicle: Vehicle }) => {
  type Detail = {
    label: string;
    value: string | number;
  };

  const details: Detail[] = [
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    { label: 'Year', value: vehicle.year },
    { label: 'Color', value: vehicle.color },
    { label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} miles` },
    { label: 'Fuel Type', value: vehicle.fuel || 'N/A' },
    { label: 'Transmission', value: vehicle.transmission || 'N/A' },
    { label: 'Status', value: vehicle.status },
    ...(vehicle.registrationNumber ? [{ label: 'Registration Number', value: vehicle.registrationNumber }] : []),
    ...(vehicle.engineCapacity ? [{ label: 'Engine Capacity', value: vehicle.engineCapacity }] : []),
    ...(vehicle.co2Emissions ? [{ label: 'CO2 Emissions', value: `${vehicle.co2Emissions}g/km` }] : []),
    ...(vehicle.range ? [{ label: 'Range', value: `${vehicle.range} miles` }] : [])
  ];

  return (
    <Card title="Vehicle Details">
      <DetailGrid>
        {details.map((detail, index) => (
          <DetailItem key={index} label={detail.label} value={detail.value} />
        ))}
      </DetailGrid>
    </Card>
  );
});

// Add new component for vehicle documentation and status
export const VehicleDocumentation = memo(({ vehicle }: { vehicle: Vehicle }) => {
  type Doc = {
    label: string;
    value: string;
  };

  const documentation: Doc[] = [
    ...(vehicle.taxStatus ? [{ label: 'Tax Status', value: vehicle.taxStatus }] : []),
    ...(vehicle.motStatus ? [{ label: 'MOT Status', value: vehicle.motStatus }] : []),
    ...(vehicle.euroStatus ? [{ label: 'Euro Status', value: vehicle.euroStatus }] : []),
    ...(vehicle.dateOfLastV5CIssued ? [{ 
      label: 'Last V5C Issued', 
      value: new Date(vehicle.dateOfLastV5CIssued).toLocaleDateString() 
    }] : [])
  ];

  if (documentation.length === 0) return null;

  return (
    <Card title="Vehicle Documentation">
      <DetailGrid>
        {documentation.map((doc, index) => (
          <DetailItem key={index} label={doc.label} value={doc.value} />
        ))}
      </DetailGrid>
    </Card>
  );
});

// Helper function to render vehicle type icon
export const VehicleTypeIcon = memo(({ type }: { type: VehicleType }) => {
  const iconProps = { className: "h-5 w-5" };
  
  switch (type) {
    case 'car':
    case 'used-car':
      return <Car {...iconProps} />;
    case 'van':
    case 'truck':
      return <Truck {...iconProps} />;
    default:
      return null;
  }
});

// Display names for debugging
Card.displayName = 'Card';
DetailGrid.displayName = 'DetailGrid';
DetailItem.displayName = 'DetailItem';
VehicleSpecificDetails.displayName = 'VehicleSpecificDetails';
CommonVehicleDetails.displayName = 'CommonVehicleDetails';
VehicleDocumentation.displayName = 'VehicleDocumentation';
VehicleTypeIcon.displayName = 'VehicleTypeIcon'; 