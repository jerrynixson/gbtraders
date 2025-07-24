import { Suspense } from 'react';
import { Metadata } from 'next';
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { VehicleType, VehicleFilters, FuelType, TransmissionType, CarBodyStyle } from '@/types/vehicles';
import EnhancedSearchPage from '@/components/search/enhanced-search-page';
import Loading from './loading';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Search Vehicles | Your Marketplace',
  description: 'Search for cars, trucks, vans, and more. Find your perfect vehicle with our advanced search filters.',
  openGraph: {
    title: 'Search Vehicles | Your Marketplace',
    description: 'Search for cars, trucks, vans, and more. Find your perfect vehicle with our advanced search filters.',
    type: 'website',
  },
};

// Search params type
interface SearchParams {
  type?: string;
  make?: string;
  model?: string;
  minPrice?: string;
  maxPrice?: string;
  minYear?: string;
  maxYear?: string;
  minMileage?: string;
  maxMileage?: string;
  fuel?: string;
  transmission?: string;
  bodyStyle?: string;
  page?: string;
  view?: 'grid' | 'list';
  sort?: string;
  q?: string;
  location?: string;
}

// Convert search params to filters
function getFiltersFromSearchParams(searchParams: SearchParams): VehicleFilters {
  const filters: VehicleFilters = {};
  // Only set type if explicitly provided in search params
  if (searchParams.type) {
    filters.type = searchParams.type as VehicleType;
  }
  // Don't set a default type - undefined means show all vehicle types

  // Handle keyword search - if there's a 'q' parameter, this will be handled by Algolia
  // We don't add it to filters as the enhanced search page will handle keyword searches differently

  // Handle specific make/model filters
  if (searchParams.make) {
    filters.make = Array.isArray(searchParams.make) 
      ? searchParams.make 
      : [searchParams.make];
  }

  if (searchParams.model) {
    filters.model = Array.isArray(searchParams.model) 
      ? searchParams.model 
      : [searchParams.model];
  }

  // Handle other filters
  if (searchParams.minPrice) {
    filters.minPrice = Number(searchParams.minPrice);
  }

  if (searchParams.maxPrice) {
    filters.maxPrice = Number(searchParams.maxPrice);
  }

  if (searchParams.minYear) {
    filters.minYear = Number(searchParams.minYear);
  }

  if (searchParams.maxYear) {
    filters.maxYear = Number(searchParams.maxYear);
  }

  if (searchParams.minMileage) {
    filters.minMileage = Number(searchParams.minMileage);
  }

  if (searchParams.maxMileage) {
    filters.maxMileage = Number(searchParams.maxMileage);
  }

  // Ensure 'fuelType' is used instead of 'fuel' to match VehicleFilters
  if (searchParams.fuel) {
    const fuelParam = Array.isArray(searchParams.fuel) 
      ? searchParams.fuel[0] 
      : searchParams.fuel;
    filters.fuelType = fuelParam.split(',').map((f: string) => f.trim() as FuelType);
  }

  if (searchParams.transmission) {
    const transmissionParam = Array.isArray(searchParams.transmission) 
      ? searchParams.transmission[0] 
      : searchParams.transmission;
    filters.transmission = transmissionParam.split(',').map((t: string) => t.trim() as TransmissionType);
  }

  if (searchParams.bodyStyle) {
    filters.bodyStyle = Array.isArray(searchParams.bodyStyle) 
      ? (searchParams.bodyStyle as CarBodyStyle[]) 
      : [searchParams.bodyStyle as CarBodyStyle];
  }

  return filters;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const repository = new VehicleRepository();
  
  // Await search params as required by Next.js 15
  const awaitedSearchParams = await searchParams;
  
  // Get filters and other parameters
  const filters = getFiltersFromSearchParams(awaitedSearchParams);
  const page = typeof awaitedSearchParams.page === 'string' ? parseInt(awaitedSearchParams.page) : 1;
  const view = (awaitedSearchParams.view as 'grid' | 'list') || 'grid';
  const sort = awaitedSearchParams.sort as string || 'createdAt:desc';
  const keyword = awaitedSearchParams.q;

  // For keyword searches, we'll let the enhanced search page handle the Algolia search
  // For filter-based searches, we'll let the enhanced search page handle everything locally
  let initialVehicles: any = [];
  let availableMakes: string[] = [];
  let availableModels: string[] = [];

  // Don't pre-fetch any data here - let the enhanced search page handle all data loading locally
  // This avoids Firebase index requirements and keeps everything client-side

  return (
    <Suspense fallback={<Loading />}>
      <EnhancedSearchPage
        initialVehicles={initialVehicles}
        availableMakes={availableMakes}
        availableModels={availableModels}
        selectedVehicleType={filters.type || 'car'} // Default to 'car' for UI purposes only
        initialFilters={filters}
        view={view}
        page={page}
        sort={sort}
      />
    </Suspense>
  );
}