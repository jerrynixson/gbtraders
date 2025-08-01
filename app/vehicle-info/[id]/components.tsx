import { memo } from 'react';
import { format } from 'date-fns';
import { Vehicle, Car as CarType, Van as VanType, Truck as TruckType, UsedCar, VehicleType } from "@/types/vehicles"
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
  // 'Registration Number': <Hash className="h-5 w-5 text-indigo-500" />,
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

interface DetailItemProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
}

const DetailItem = memo(({ label, value, icon }: DetailItemProps) => {
  // Don't render if value is undefined, null, or empty string
  if (value === undefined || value === null || value === '') {
    return null;
  }
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl transition-shadow duration-200 border border-transparent bg-white text-gray-900 hover:shadow-md hover:border-indigo-200">
      <div className="pt-1">{icon || detailIcons[label] || <CircleCheck className="h-5 w-5 text-gray-300" />}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-base">{value}</p>
      </div>
    </div>
  );
});

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Car Specifications</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {details.filter(Boolean).map((detail, index) => detail && (
              <DetailItem key={index} label={detail.label} value={detail.value as string | number} />
            ))}
          </div>
          {usedCar && usedCar.mot && usedCar.mot.advisories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">MOT Advisories</h4>
              <ul className="space-y-1">
                {usedCar.mot.advisories.map((advisory: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                    <span className="text-sm text-gray-600">{advisory}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Van Specifications</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {details.filter(Boolean).map((detail, index) => (
              <DetailItem key={index} label={detail.label} value={detail.value as string | number} />
            ))}
          </div>
        </div>
      </div>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Truck Specifications</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {details.filter(Boolean).map((detail, index) => (
              <DetailItem key={index} label={detail.label} value={detail.value as string | number} />
            ))}
          </div>
        </div>
      </div>
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

  // Helper function to safely format dates
  const formatDate = (dateString?: string | Date | null): string | undefined => {
    if (!dateString) return undefined;
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) return undefined;
      return format(date, 'PP');
    } catch (e) {
      return undefined;
    }
  };

  const details: Detail[] = [
    { label: 'Make', value: vehicle.make },
    { label: 'Model', value: vehicle.model },
    { label: 'Year', value: vehicle.year },
    { 
      label: 'Mileage', 
      value: vehicle.mileage !== undefined && vehicle.mileage !== null 
        ? `${vehicle.mileage.toLocaleString()} miles` 
        : undefined 
    },
    { label: 'Fuel Type', value: vehicle.fuel },
    { label: 'Transmission', value: vehicle.transmission },
    { label: 'Color', value: vehicle.color },
    { label: 'Engine Size', value: vehicle.engineCapacity },
    { 
      label: 'CO2 Emissions', 
      value: vehicle.co2Emissions ? `${vehicle.co2Emissions} g/km` : undefined 
    },
    { label: 'Tax Status', value: vehicle.taxStatus },
    { label: 'MOT Status', value: vehicle.motStatus },
    { label: 'Registration', value: vehicle.registrationNumber },
    { 
      label: 'V5C Issued', 
      value: formatDate(vehicle.dateOfLastV5CIssued)
    },
    { label: 'Euro Status', value: vehicle.euroStatus },
    { 
      label: 'Range', 
      value: vehicle.range ? `${vehicle.range} miles` : undefined 
    },
  ].filter(detail => {
    // Filter out details with undefined values
    if (detail.value === undefined) return false;
    // Special handling for numeric values that might be 0
    if (typeof detail.value === 'number' && isNaN(detail.value)) return false;
    // Special handling for empty strings
    if (typeof detail.value === 'string' && detail.value.trim() === '') return false;
    return true;
  });

  if (details.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Vehicle Overview</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {details.map((detail, index) => (
            <DetailItem key={index} label={detail.label} value={detail.value} />
          ))}
        </div>
      </div>
    </div>
  );
});

// Vehicle documentation and status component
export const VehicleDocumentation = memo(({ vehicle }: { vehicle: Vehicle }) => {
  // Helper function to safely format dates
  const formatDate = (dateString?: string | Date | null): string | undefined => {
    if (!dateString) return undefined;
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) return undefined;
      return format(date, 'PP');
    } catch (e) {
      return undefined;
    }
  };

  const docs = [
    { 
      label: 'V5C Issued', 
      value: formatDate(vehicle.dateOfLastV5CIssued)
    },
    { label: 'MOT Status', value: vehicle.motStatus },
    { label: 'Tax Status', value: vehicle.taxStatus },
    { label: 'Euro Status', value: vehicle.euroStatus },
  ].filter(doc => {
    // Filter out undefined, null, empty strings, and 'Invalid Date' strings
    if (doc.value === undefined || doc.value === null) return false;
    if (typeof doc.value === 'string' && (doc.value.trim() === '' || doc.value === 'Invalid Date')) return false;
    return true;
  });

  if (docs.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {docs.map((doc, index) => (
            <DetailItem 
              key={index} 
              label={doc.label} 
              value={doc.value as string | number} 
            />
          ))}
        </div>
      </div>
    </div>
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