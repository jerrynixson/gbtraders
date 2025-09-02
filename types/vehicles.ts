// Base vehicle interface with common fields
export interface BaseVehicle {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  price: number;
  monthlyPrice?: number;
  mileage: number;
  range?: number;
  euroStatus?: string;
  dateOfLastV5CIssued?: Date;
  taxStatus?: 'taxed' | 'tax-due' | 'tax-exempt';
  engineCapacity?: string;
  motStatus?: 'passed' | 'failed' | 'due';
  co2Emissions?: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  color: string;
  registrationNumber?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: string[];
  images: string[];
  imageUrls?: string[];
  description?: string;
  dealerUid: string;
  createdAt: Date;
  updatedAt: Date;
  status: VehicleStatus;
}

// Vehicle type-specific interfaces
export interface Car extends BaseVehicle {
  type: 'car';
  bodyStyle: CarBodyStyle;
  doors: number;
  seats: number;
  engineSize: number;
  safetyRating?: number;
}

export interface UsedCar extends Omit<Car, 'type'> {
  type: 'used-car';
  previousOwners: number;
  serviceHistory: boolean;
  mot?: {
    expiryDate: Date;
    advisories: string[];
  };
}

export interface Van extends BaseVehicle {
  type: 'van';
  loadVolume: number; // in cubic meters
  loadLength: number; // in meters
  roofHeight: number; // in meters
  wheelbase: number; // in meters
  payload: number; // in kg
  grossWeight: number; // in kg
  bodyType: VanBodyType;
  doors: number;
}

export interface Truck extends BaseVehicle {
  type: 'truck';
  axles: number;
  maxPayload: number; // in kg
  grossWeight: number; // in kg
  bodyType: TruckBodyType;
  cabType: TruckCabType;
  transmission: 'manual' | 'automatic';
}

// Union type for all vehicle types
export type Vehicle = Car | UsedCar | Truck | Van;

// Enums and types
export type VehicleType = 'car' | 'used-car' | 'truck' | 'van';
export type VehicleStatus = 'available' | 'sold' | 'reserved' | 'maintenance';

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type TransmissionType = 'manual' | 'automatic' | 'semi-automatic';

export type CarBodyStyle = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'van' | 'truck';

export type VanBodyType = 'panel' | 'dropside' | 'tipper' | 'luton' | 'curtainside' | 'box';

export type TruckBodyType = 'flatbed' | 'box' | 'curtainside' | 'tipper' | 'tanker' | 'refrigerated';

export type TruckCabType = 'day' | 'sleeper' | 'crew';

// Filter types
export interface VehicleFilters {
  type?: VehicleType;
  make?: string[];
  model?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  fuelType?: FuelType[];
  transmission?: TransmissionType[];
  bodyStyle?: CarBodyStyle[];
  location?: {
    city?: string;
    country?: string;
    postcode?: string;
    radius?: number; // in kilometers
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

// Repository types
export interface VehicleQueryOptions {
  filters?: VehicleFilters;
  sort?: {
    field: keyof BaseVehicle;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface VehicleQueryResult<T = Vehicle> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Vehicle summary type for list views
export interface VehicleSummary {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  price: number;
  monthlyPrice?: number;
  mileage: number;
  fuel?: FuelType;
  transmission?: TransmissionType;
  color: string;
  registrationNumber?: string;
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  mainImage: string;
  imageUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Component Props Types
export interface VehicleCardProps {
  vehicle: VehicleSummary;
  view?: 'grid' | 'list';
  isHighlighted?: boolean;
  onShare?: () => void;
}

export interface FilterSidebarProps {
  initialFilters?: VehicleFilters;
  onFilterChange: (filters: VehicleFilters) => void;
  availableMakes: string[];
  availableModels: Record<string, string[]>;
  selectedVehicleType: VehicleType;
}