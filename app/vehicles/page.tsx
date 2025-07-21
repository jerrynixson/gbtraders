import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { VehicleFilter, VehicleSummary } from '@/types/vehicles';

interface SearchPageProps {
  searchParams: {
    type?: string;
    make?: string;
    model?: string;
    minYear?: string;
    maxYear?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export default async function VehicleSearchPage({ searchParams }: SearchPageProps) {
  const repository = new VehicleRepository();
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  // Convert search params to filter
  const filter: VehicleFilter = {
    type: searchParams.type as any,
    make: searchParams.make,
    model: searchParams.model,
    minYear: searchParams.minYear ? parseInt(searchParams.minYear) : undefined,
    maxYear: searchParams.maxYear ? parseInt(searchParams.maxYear) : undefined,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
  };

  // Fetch vehicle summaries and available makes/models for filters
  const [vehicles, makes] = await Promise.all([
    repository.findSummaries(filter, page),
    repository.getMakes()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vehicle Listings</h1>
      
      {/* Filter Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        {/* Add your filter UI components here */}
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle: VehicleSummary) => (
          <div key={vehicle.id} className="border rounded-lg overflow-hidden shadow-sm">
            {/* Vehicle Image */}
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={vehicle.image}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="object-cover w-full h-full"
              />
            </div>

            {/* Vehicle Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{vehicle.location.city}, {vehicle.location.country}</p>
                <p>Reg: {vehicle.registrationNumber}</p>
                <p>Fuel: {vehicle.fuelType}</p>
              </div>
              <p className="text-xl font-bold mt-2">
                ${vehicle.price.toLocaleString()}
              </p>
              <div className="mt-4">
                <a
                  href={`/vehicle-info/${vehicle.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        {page > 1 && (
          <a
            href={`/vehicles?page=${page - 1}`}
            className="mx-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Previous
          </a>
        )}
        {vehicles.length === 20 && (
          <a
            href={`/vehicles?page=${page + 1}`}
            className="mx-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next
          </a>
        )}
      </div>
    </div>
  );
} 