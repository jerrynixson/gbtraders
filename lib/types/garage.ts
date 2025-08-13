import { Timestamp } from 'firebase/firestore';

// Main Garage interface used in the UI
export interface Garage {
  id: string;
  name: string;
  address: string;
  phone: string;
  image?: string; // Make optional since not all garages may have images
  coverImage?: string;
  price: string;
  description: string;
  services: string[];
  rating: number;
  openingHours: {
    weekdays: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  website: string;
  email: string;
  paymentMethods: string[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

// Firestore document structure (what gets saved to database)
export interface GarageDocument {
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  services: string[];
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  image?: string;
  coverImage?: string;
  price?: string;
  paymentMethods?: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  rating?: number;
}

// Form data interface for creating/editing garages
export interface GarageFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  image?: string;
  coverImage?: string;
  price?: string;
  services: string[];
  openingHours: {
    weekdays: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  paymentMethods?: string[];
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

// Available services list
export const AVAILABLE_SERVICES = [
  "Electric issue repair",
  "Programming",
  "Commercial vehicle repair",
  "Sunroof repair",
  "Suspension repair",
  "Vehicle diagnostics",
  "Manual Gearbox repair",
  "Automatic Gearbox repair",
  "DPF Cleaning",
  "Starter motor/Alternator Repair",
  "Battery servicing",
  "Air conditioning",
  "Brakes and Clutches",
  "Electric car/van Repair",
  "Hybrid car repair",
  "LPG Repair",
  "Range Rover Specialist",
  "Wheel Alignment",
  "Tyre Change",
  "Car Accessories and Parts",
  "Garage Equipment",
  "Body Repair",
  "MOT",
  "Welding",
  "Turbochargers Repair",
  "Motorcycle repairs & services",
  "Engine repair",
  "Transmission repair",
  "Exhaust repair",
  "Clutch replacement",
  "Brake pad replacement",
  "Oil change",
  "Radiator repair",
  "Windscreen replacement",
  "Paint protection",
  "Detailing services"
] as const;

export type ServiceType = typeof AVAILABLE_SERVICES[number];

// Garage creation/update response
export interface GarageResponse {
  success: boolean;
  garageId?: string;
  error?: string;
}

// Garage stats interface
export interface GarageStats {
  total: number;
  avgRating: number;
  totalServices: number;
}
