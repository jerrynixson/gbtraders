import { Gauge, Fuel, Settings } from 'lucide-react';

type VehicleSpecsBarProps = {
  engineSize: string | number;  // Can be string or number (e.g., 2.0 or '2.0L')
  mileage: number;
  fuelType: string;
  gearbox: string;
};

export function VehicleSpecsBar({ engineSize, mileage, fuelType, gearbox }: VehicleSpecsBarProps) {
  return (
    <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm">
      <div className="flex flex-col items-center text-xs sm:text-sm text-gray-700">
        <Gauge className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
        <span className="font-medium text-xs sm:text-sm">
          {typeof engineSize === 'number' 
            ? `${engineSize.toFixed(1)}L` 
            : engineSize.endsWith('L') 
              ? engineSize 
              : `${engineSize}L`}
        </span>
        <span className="text-[10px] sm:text-xs">Engine</span>
      </div>
      <div className="flex flex-col items-center text-xs sm:text-sm text-gray-700">
        <span className="text-base sm:text-lg font-semibold">{(mileage / 1000).toFixed(1)}k</span>
        <span className="text-[10px] sm:text-xs">Miles</span>
      </div>
      <div className="flex flex-col items-center text-xs sm:text-sm text-gray-700">
        <Fuel className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
        <span className="font-medium text-xs sm:text-sm">{fuelType}</span>
      </div>
      <div className="flex flex-col items-center text-xs sm:text-sm text-gray-700">
        <Settings className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
        <span className="font-medium text-xs sm:text-sm">{gearbox}</span>
      </div>
    </div>
  );
}
