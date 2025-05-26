import { Suspense } from 'react';
import { Metadata } from 'next';
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { VehicleType, VehicleFilters } from '@/types/vehicles';
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
  type?: VehicleType;
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
}

// Convert search params to filters
function getFiltersFromSearchParams(searchParams: SearchParams): VehicleFilters {
  return {
    type: searchParams.type || 'car',
    make: searchParams.make ? [searchParams.make] : undefined,
    model: searchParams.model ? [searchParams.model] : undefined,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
    minYear: searchParams.minYear ? parseInt(searchParams.minYear) : undefined,
    maxYear: searchParams.maxYear ? parseInt(searchParams.maxYear) : undefined,
    minMileage: searchParams.minMileage ? parseInt(searchParams.minMileage) : undefined,
    maxMileage: searchParams.maxMileage ? parseInt(searchParams.maxMileage) : undefined,
    fuelType: searchParams.fuel ? [searchParams.fuel as any] : undefined,
    transmission: searchParams.transmission ? [searchParams.transmission as any] : undefined,
    bodyStyle: searchParams.bodyStyle ? [searchParams.bodyStyle as any] : undefined,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const repository = new VehicleRepository();
  const filters = getFiltersFromSearchParams(searchParams);
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const view = searchParams.view || 'grid';

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
      />
    </Suspense>
  );
}