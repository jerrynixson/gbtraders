export interface VehicleBase {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  color: string;
  year: number;
  price: number;
  mileage: number;
  range: number;
  euroStatus: string;
  dateOfLastV5CIssued: Date;
  taxStatus: 'taxed' | 'tax-due' | 'tax-exempt';
  engineCapacity: string;
  motStatus: 'passed' | 'failed' | 'due';
  co2Emissions: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  location: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'available' | 'sold' | 'pending';
  dealerUid: string;
}

export interface VehicleSummary extends Pick<VehicleBase, 
  'id' | 'make' | 'model' | 'year' | 'price' | 'images' | 'location' | 'registrationNumber' | 'fuelType' 	
> {
  type: VehicleType;
  image: string;
}

export interface Car extends VehicleBase {
  type: 'car';
  bodyType: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'wagon';
  doors: number;
  seats: number;
  features: string[];
}

export interface Van extends VehicleBase {
  type: 'van';
  cargoVolume: number; // in cubic meters
  maxPayload: number; // in kg
  length: number; // in meters
  height: number; // in meters
  features: string[];
}

export interface Truck extends VehicleBase {
  type: 'truck';
  maxPayload: number; // in kg
  axles: number;
  cabType: 'day' | 'sleeper';
  features: string[];
}

export type Vehicle = Car | Van | Truck;
export type VehicleType = Vehicle['type'];

export interface VehicleFilter {
  type?: VehicleType;
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: VehicleBase['fuelType'];
  transmission?: VehicleBase['transmission'];
  location?: {
    city?: string;
    country?: string;
  };
} 