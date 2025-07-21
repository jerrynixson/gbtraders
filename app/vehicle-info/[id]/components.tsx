import { memo } from 'react'
import { Vehicle, Car as CarType, UsedCar, Van as VanType, Truck as TruckType, VehicleType } from "@/types/vehicles"
import { Car, Truck, Calendar, Gauge, Fuel, Settings, BadgeCheck, Hash, Zap, CircleCheck, CircleX, Info, Palette, TrendingUp } from "lucide-react"

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

const detailIcons: Record<string, React.ReactNode> = {
  'Make': <Car className="h-5 w-5 text-indigo-500" />,
  'Model': <BadgeCheck className="h-5 w-5 text-indigo-500" />,
  'Year': <Calendar className="h-5 w-5 text-indigo-500" />,
  'Color': <Palette className="h-5 w-5 text-indigo-500" />,
  'Mileage': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Fuel Type': <Fuel className="h-5 w-5 text-indigo-500" />,
  'Transmission': <Settings className="h-5 w-5 text-indigo-500" />,
  'Status': <Info className="h-5 w-5 text-indigo-500" />,
  'Registration Number': <Hash className="h-5 w-5 text-indigo-500" />,
  'Engine Capacity': <Zap className="h-5 w-5 text-indigo-500" />,
  'CO2 Emissions': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Range': <TrendingUp className="h-5 w-5 text-indigo-500" />,
  'Body Style': <Truck className="h-5 w-5 text-indigo-500" />,
  'Doors': <CircleCheck className="h-5 w-5 text-indigo-500" />,
  'Seats': <CircleCheck className="h-5 w-5 text-indigo-500" />,
  'Engine Size': <Zap className="h-5 w-5 text-indigo-500" />,
  'Safety Rating': <BadgeCheck className="h-5 w-5 text-indigo-500" />,
  'Previous Owners': <CircleCheck className="h-5 w-5 text-indigo-500" />,
  'Service History': <Info className="h-5 w-5 text-indigo-500" />,
  'MOT Expiry': <Calendar className="h-5 w-5 text-indigo-500" />,
  'Body Type': <Truck className="h-5 w-5 text-indigo-500" />,
  'Load Volume': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Load Length': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Roof Height': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Wheelbase': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Payload': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Gross Weight': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Cab Type': <Truck className="h-5 w-5 text-indigo-500" />,
  'Axles': <CircleCheck className="h-5 w-5 text-indigo-500" />,
  'Max Payload': <Gauge className="h-5 w-5 text-indigo-500" />,
  'Tax Status': <Info className="h-5 w-5 text-indigo-500" />,
  'MOT Status': <Info className="h-5 w-5 text-indigo-500" />,
  'Euro Status': <Info className="h-5 w-5 text-indigo-500" />,
  'Last V5C Issued': <Calendar className="h-5 w-5 text-indigo-500" />,
};

const DetailItem = memo(({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl transition-shadow duration-200 border border-transparent bg-white text-gray-900 hover:shadow-md hover:border-indigo-200">
    <div className="pt-1">{icon || detailIcons[label] || <CircleCheck className="h-5 w-5 text-gray-300" />}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-base">{value}</p>
    </div>
  </div>
));

// Helper function to render vehicle-specific details
export const VehicleSpecificDetails = memo(({ vehicle }: { vehicle: Vehicle }) => {
  const renderCarDetails = (car: CarType | UsedCar) => {
    const usedCar = vehicle.type === 'used-car' ? vehicle as UsedCar : null;
    const details = [
      { label: 'Body Style', value: car.bodyStyle },
      { label: 'Doors', value: car.doors },
      { label: 'Seats', value: car.seats },
      { label: 'Engine Size', value: car.engineSize !== undefined && car.engineSize !== null ? `${car.engineSize}L` : undefined },
      car.safetyRating ? { label: 'Safety Rating', value: `${car.safetyRating}/5` } : null,
      usedCar ? { label: 'Previous Owners', value: usedCar.previousOwners } : null,
      usedCar ? { label: 'Service History', value: usedCar.serviceHistory ? 'Available' : 'Not Available' } : null,
      usedCar && usedCar.mot ? { label: 'MOT Expiry', value: new Date(usedCar.mot.expiryDate).toLocaleDateString() } : null
    ].filter(d => d && d.value !== undefined && d.value !== null && d.value !== '' && d.value !== 'undefinedL' && d.value !== 'Invalid Date');

    if (details.length === 0) return null;

    return (
      <Card title="Car Specifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.filter(Boolean).map((detail, index) => detail && (
            <DetailItem key={index} label={detail.label} value={detail.value as string | number} />
          ))}
        </div>
        {usedCar && usedCar.mot && usedCar.mot.advisories.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Advisories:</p>
            <ul className="list-disc list-inside">
              {usedCar.mot.advisories.map((advisory: string, index: number) => (
                <li key={index} className="text-sm text-gray-600">{advisory}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
  };

  const renderVanDetails = (van: VanType) => {
    const details = [
      { label: 'Body Type', value: van.bodyType },
      { label: 'Load Volume', value: van.loadVolume ? `${van.loadVolume}m³` : undefined },
      { label: 'Load Length', value: van.loadLength ? `${van.loadLength}m` : undefined },
      { label: 'Roof Height', value: van.roofHeight ? `${van.roofHeight}m` : undefined },
      { label: 'Wheelbase', value: van.wheelbase ? `${van.wheelbase}m` : undefined },
      { label: 'Payload', value: van.payload ? `${van.payload}kg` : undefined },
      { label: 'Gross Weight', value: van.grossWeight ? `${van.grossWeight}kg` : undefined },
      { label: 'Doors', value: van.doors }
    ].filter(d => d && d.value !== undefined && d.value !== null && d.value !== '' && d.value !== 'undefinedL' && d.value !== 'Invalid Date');
    if (details.length === 0) return null;
    return (
      <Card title="Van Specifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.filter(Boolean).map((detail, index) => (
            <DetailItem key={index} label={detail.label} value={detail.value as string | number} />
          ))}
        </div>
      </Card>
    );
  };

  const renderTruckDetails = (truck: TruckType) => {
    const details = [
      { label: 'Body Type', value: truck.bodyType },
      { label: 'Cab Type', value: truck.cabType },
      { label: 'Axles', value: truck.axles },
      { label: 'Max Payload', value: truck.maxPayload ? `${truck.maxPayload}kg` : undefined },
      { label: 'Gross Weight', value: truck.grossWeight ? `${truck.grossWeight}kg` : undefined },
      { label: 'Transmission', value: truck.transmission }
    ].filter(d => d && d.value !== undefined && d.value !== null && d.value !== '' && d.value !== 'undefinedL' && d.value !== 'Invalid Date');
    if (details.length === 0) return null;
    return (
      <Card title="Truck Specifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details.filter(Boolean).map((detail, index) => (
            <DetailItem key={index} label={detail.label} value={detail.value as string | number} />
          ))}
        </div>
      </Card>
    );
  };

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
    value: string | number | undefined | null;
  };

  const details: Detail[] = [
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    { label: 'Year', value: vehicle.year },
    { label: 'Color', value: vehicle.color },
    { label: 'Mileage', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : undefined },
    { label: 'Fuel Type', value: vehicle.fuel || undefined },
    { label: 'Transmission', value: vehicle.transmission || undefined },
    ...(vehicle.registrationNumber ? [{ label: 'Registration Number', value: vehicle.registrationNumber }] : []),
    { label: 'Status', value: vehicle.status },
    ...(vehicle.engineCapacity ? [{ label: 'Engine Capacity', value: vehicle.engineCapacity }] : []),
    ...(vehicle.co2Emissions ? [{ label: 'CO2 Emissions', value: `${vehicle.co2Emissions}g/km` }] : []),
    ...(vehicle.range ? [{ label: 'Range', value: `${vehicle.range} miles` }] : [])
  ];

  const filtered = details.filter(Boolean).filter(
    d => d.value !== undefined && d.value !== null && d.value !== '' && d.value !== 'undefinedL' && d.value !== 'Invalid Date'
  );

  if (filtered.length === 0) return null;

  return (
    <Card title="Vehicle Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((detail, index) => (
          <DetailItem key={index} label={detail.label} value={detail.value as string | number} />
        ))}
      </div>
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

  const filtered = documentation.filter(Boolean).filter(d => d.value !== undefined && d.value !== null && d.value !== '' && d.value !== 'Invalid Date');
  if (filtered.length === 0) return null;

  return (
    <Card title="Vehicle Documentation">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc, index) => (
          <DetailItem key={index} label={doc.label} value={doc.value as string | number} />
        ))}
      </div>
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