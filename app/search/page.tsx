import { Suspense } from 'react';
import { Metadata } from 'next';
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { VehicleType, VehicleFilters, FuelType, TransmissionType, CarBodyStyle } from '@/types/vehicles';
import ClientPage from './client-page';
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
}

// Convert search params to filters
function getFiltersFromSearchParams(searchParams: SearchParams): VehicleFilters {
  const filters: VehicleFilters = {
    type: 'car', // Default to car type
  };

  // Handle keyword search
  if (searchParams.q) {
    const keyword = searchParams.q.toLowerCase();
    // If no specific make/model is provided, use the keyword as make
    if (!searchParams.make && !searchParams.model) {
      filters.make = [keyword];
    }
  }

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

  if (searchParams.fuelType) {
    filters.fuelType = Array.isArray(searchParams.fuelType) 
      ? searchParams.fuelType 
      : [searchParams.fuelType];
  }

  if (searchParams.transmission) {
    filters.transmission = Array.isArray(searchParams.transmission) 
      ? searchParams.transmission 
      : [searchParams.transmission];
  }

  if (searchParams.bodyStyle) {
    filters.bodyStyle = Array.isArray(searchParams.bodyStyle) 
      ? searchParams.bodyStyle 
      : [searchParams.bodyStyle];
  }

  return filters;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const repository = new VehicleRepository();
  
  // Ensure searchParams is treated as a ReadonlyURLSearchParams
  const filters = getFiltersFromSearchParams(searchParams);
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const view = (searchParams.view as 'grid' | 'list') || 'grid';
  const sort = searchParams.sort as string || 'createdAt:desc';

  // Fetch data
  const [vehicles, availableMakes, availableModels] = await Promise.all([
    repository.searchVehicles(filters, { page, limit: 12 }),
    repository.getAvailableMakes(filters.type),
    filters.make ? repository.getAvailableModels(filters.type, filters.make[0]) : Promise.resolve([]),
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <ClientPage
        initialVehicles={vehicles}
        availableMakes={availableMakes}
        availableModels={availableModels}
        selectedVehicleType={filters.type}
        initialFilters={filters}
        view={view}
        page={page}
        sort={sort}
      />
    </Suspense>
  );
}