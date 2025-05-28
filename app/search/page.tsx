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
}

// Convert search params to filters
function getFiltersFromSearchParams(searchParams: SearchParams): VehicleFilters {
  return {
    type: (searchParams.type as VehicleType) || 'car',
    make: searchParams.make ? [searchParams.make] : undefined,
    model: searchParams.model ? [searchParams.model] : undefined,
    minPrice: typeof searchParams.minPrice === 'string' ? parseInt(searchParams.minPrice) : undefined,
    maxPrice: typeof searchParams.maxPrice === 'string' ? parseInt(searchParams.maxPrice) : undefined,
    minYear: typeof searchParams.minYear === 'string' ? parseInt(searchParams.minYear) : undefined,
    maxYear: typeof searchParams.maxYear === 'string' ? parseInt(searchParams.maxYear) : undefined,
    minMileage: typeof searchParams.minMileage === 'string' ? parseInt(searchParams.minMileage) : undefined,
    maxMileage: typeof searchParams.maxMileage === 'string' ? parseInt(searchParams.maxMileage) : undefined,
    fuelType: searchParams.fuel ? [searchParams.fuel as FuelType] : undefined,
    transmission: searchParams.transmission ? [searchParams.transmission as TransmissionType] : undefined,
    bodyStyle: searchParams.bodyStyle ? [searchParams.bodyStyle as CarBodyStyle] : undefined,
  };
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