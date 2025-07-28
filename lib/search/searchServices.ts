import algoliasearch from 'algoliasearch/lite';
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { VehicleFilters, VehicleSummary } from '@/types/vehicles';
import { cache } from 'react';
import { calculateDistance } from '@/lib/utils/location';

// Algolia configuration (read-only search key - safe for client)
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || "";
const ALGOLIA_INDEX = process.env.NEXT_PUBLIC_ALGOLIA_VEHICLES_INDEX || "vehicles";

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

export interface FilterOptions {
  type?: string;
  make?: string[];
  model?: string[];
  fuelType?: string[];
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  transmission?: string[];
  bodyType?: string[];
  location?: {
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    radius?: number; // in kilometers
  };
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface SortOptions {
  field: 'price' | 'year' | 'mileage' | 'createdAt';
  direction: 'asc' | 'desc';
}

/**
 * 🔍 Flow 1: Hero Search Bar (Algolia Keyword Search)
 * - Performs full-text search on keywords using Algolia
 * - Limits results to 100 for performance
 * - Fetches full documents from Firestore using document IDs
 */
export async function searchWithAlgoliaKeywords(
  keyword: string
): Promise<VehicleSummary[]> {
  try {
    if (!keyword.trim()) return [];

    const index = searchClient.initIndex(ALGOLIA_INDEX);
    
    // Search Algolia with keyword limit of 100
    const { hits } = await index.search(keyword, {
      hitsPerPage: 100,
      attributesToRetrieve: ['objectID']
    });

    if (hits.length === 0) return [];

    // Extract Firestore document IDs
    const documentIds = hits.map((hit: any) => hit.objectID);

    // Batch fetch from Firestore
    const repository = new VehicleRepository();
    const vehicles = await batchGetVehiclesFromFirestore(documentIds, repository);

    return vehicles;
  } catch (error) {
    console.error('Error in Algolia keyword search:', error);
    return [];
  }
}

/**
 * Batch fetch vehicles from Firestore using document IDs
 */
async function batchGetVehiclesFromFirestore(
  documentIds: string[],
  repository: VehicleRepository
): Promise<VehicleSummary[]> {
  const vehicles: VehicleSummary[] = [];
  
  try {
    // Firestore batch get limit is 500, but we're limiting to 100 from Algolia
    const batchPromises = documentIds.map(async (id) => {
      try {
        const vehicle = await repository.getVehicleById(id);
        if (vehicle) {
          return repository.convertToSummary(vehicle);
        }
        return null;
      } catch (error) {
        console.error(`Error fetching vehicle ${id}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(batchPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        vehicles.push(result.value);
      }
    });

    return vehicles;
  } catch (error) {
    console.error('Error in batch fetch from Firestore:', error);
    return [];
  }
}

/**
 * 🔍 Flow 2: Filtered Search Page (Local Filtering)
 * - Fetches all vehicles from Firestore
 * - Applies local filtering based on user selections
 */
export async function fetchVehiclesFromFirestore(): Promise<VehicleSummary[]> {
  try {
    const repository = new VehicleRepository();
    
    // Fetch all vehicles without filters (chunked if needed)
    const allVehicles = await repository.getAllVehicles();
    
    return allVehicles;
  } catch (error) {
    console.error('Error fetching all vehicles from Firestore:', error);
    return [];
  }
}

/**
 * Apply local filters to vehicle array
 */
export function applyLocalFilters(
  vehicles: VehicleSummary[],
  filters: FilterOptions
): VehicleSummary[] {
  return vehicles.filter((vehicle) => {
    // Vehicle type filter
    if (filters.type && vehicle.type?.toLowerCase() !== filters.type.toLowerCase()) {
      return false;
    }

    // Make filter
    if (filters.make?.length) {
      const makeMatches = filters.make.some(make => 
        vehicle.make.toLowerCase().includes(make.toLowerCase())
      );
      if (!makeMatches) return false;
    }

    // Model filter
    if (filters.model?.length) {
      const modelMatches = filters.model.some(model => 
        vehicle.model.toLowerCase().includes(model.toLowerCase())
      );
      if (!modelMatches) return false;
    }

    // Fuel type filter
    if (filters.fuelType?.length && ((vehicle as any).fuelType || vehicle.fuel)) {
      const vehicleFuelType = (vehicle as any).fuelType || vehicle.fuel;
      const fuelMatches = filters.fuelType.some(fuel => 
        vehicleFuelType?.toLowerCase() === fuel.toLowerCase()
      );
      if (!fuelMatches) return false;
    }

    // Price range filter
    if (filters.minPrice !== undefined && vehicle.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && vehicle.price > filters.maxPrice) {
      return false;
    }

    // Year range filter
    if (filters.minYear !== undefined && vehicle.year < filters.minYear) {
      return false;
    }
    if (filters.maxYear !== undefined && vehicle.year > filters.maxYear) {
      return false;
    }

    // Mileage range filter
    if (filters.minMileage !== undefined && vehicle.mileage < filters.minMileage) {
      return false;
    }
    if (filters.maxMileage !== undefined && vehicle.mileage > filters.maxMileage) {
      return false;
    }

    // Transmission filter
    if (filters.transmission?.length && vehicle.transmission) {
      const transmissionMatches = filters.transmission.some(trans => 
        vehicle.transmission?.toLowerCase() === trans.toLowerCase()
      );
      if (!transmissionMatches) return false;
    }

    // Body type filter (for cars)
    if (filters.bodyType?.length && vehicle.type === 'car' && (vehicle as any).bodyType) {
      const bodyTypeMatches = filters.bodyType.some((bodyType: string) => 
        (vehicle as any).bodyType?.toLowerCase() === bodyType.toLowerCase()
      );
      if (!bodyTypeMatches) return false;
    }

    // Location filter (distance-based)
    if (filters.location?.coordinates && filters.location?.radius) {
      if (!vehicle.location?.coordinates) {
        return false; // Skip vehicles without coordinates
      }
      
      const distance = calculateDistance(
        filters.location.coordinates.latitude,
        filters.location.coordinates.longitude,
        vehicle.location.coordinates.latitude,
        vehicle.location.coordinates.longitude
      );
      
      if (distance > filters.location.radius) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort vehicles locally
 */
export function sortVehiclesLocally(
  vehicles: VehicleSummary[],
  sortOptions: SortOptions
): VehicleSummary[] {
  const { field, direction } = sortOptions;
  
  return [...vehicles].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (field) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'year':
        aValue = a.year;
        bValue = b.year;
        break;
      case 'mileage':
        aValue = a.mileage;
        bValue = b.mileage;
        break;
      case 'createdAt':
        // Assuming createdAt is not available in VehicleSummary, use ID as fallback
        aValue = a.id;
        bValue = b.id;
        break;
      default:
        return 0;
    }

    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}

/**
 * Paginate vehicles locally
 */
export function paginateLocally(
  vehicles: VehicleSummary[],
  page: number,
  pageSize: number = 12
): {
  items: VehicleSummary[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const totalItems = vehicles.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  const items = vehicles.slice(startIndex, endIndex);

  return {
    items,
    totalPages,
    currentPage: page,
    totalItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

/**
 * Cache management for reducing re-fetches
 */
class VehicleCache {
  private cache = new Map<string, { data: VehicleSummary[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: VehicleSummary[]): void {
    this.cache.set(key, {
      data: [...data], // Create a copy to avoid mutations
      timestamp: Date.now()
    });
  }

  get(key: string): VehicleSummary[] | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return [...cached.data]; // Return a copy to avoid mutations
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

// Export singleton cache instance
export const vehicleCache = new VehicleCache();

/**
 * Cached version of fetchVehiclesFromFirestore
 */
export async function fetchVehiclesFromFirestoreCached(): Promise<VehicleSummary[]> {
  const cacheKey = 'all_vehicles';
  
  // Try to get from cache first
  const cached = vehicleCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from Firestore if not cached
  const vehicles = await fetchVehiclesFromFirestore();
  
  // Cache the results
  vehicleCache.set(cacheKey, vehicles);
  
  return vehicles;
}

/**
 * Utility function to convert VehicleFilters to FilterOptions
 */
export function convertVehicleFiltersToFilterOptions(filters: VehicleFilters): FilterOptions {
  return {
    type: filters.type,
    make: filters.make,
    model: filters.model,
    fuelType: filters.fuelType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minYear: filters.minYear,
    maxYear: filters.maxYear,
    minMileage: filters.minMileage,
    maxMileage: filters.maxMileage,
    transmission: filters.transmission,
    bodyType: filters.bodyStyle,
    location: filters.location?.coordinates && filters.location?.radius ? {
      coordinates: filters.location.coordinates,
      radius: filters.location.radius
    } : undefined
  };
}
