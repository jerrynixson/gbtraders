import { notFound } from 'next/navigation';
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { Car, Truck, Van, Vehicle } from '@/types/vehicles';

interface VehicleDetailPageProps {
  params: {
    id: string;
  };
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const repository = new VehicleRepository();
  const vehicle = await repository.findById(params.id);

  if (!vehicle) {
    notFound();
  }

  const renderVehicleSpecificDetails = (vehicle: Vehicle) => {
    switch (vehicle.type) {
      case 'car':
        const car = vehicle as Car;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Body Type</h3>
                <p>{car.bodyType}</p>
              </div>
              <div>
                <h3 className="font-semibold">Doors</h3>
                <p>{car.doors}</p>
              </div>
              <div>
                <h3 className="font-semibold">Seats</h3>
                <p>{car.seats}</p>
              </div>
            </div>
          </>
        );
      case 'van':
        const van = vehicle as Van;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Cargo Volume</h3>
                <p>{van.cargoVolume} m³</p>
              </div>
              <div>
                <h3 className="font-semibold">Max Payload</h3>
                <p>{van.maxPayload} kg</p>
              </div>
              <div>
                <h3 className="font-semibold">Dimensions</h3>
                <p>{van.length}m x {van.height}m</p>
              </div>
            </div>
          </>
        );
      case 'truck':
        const truck = vehicle as Truck;
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Max Payload</h3>
                <p>{truck.maxPayload} kg</p>
              </div>
              <div>
                <h3 className="font-semibold">Axles</h3>
                <p>{truck.axles}</p>
              </div>
              <div>
                <h3 className="font-semibold">Cab Type</h3>
                <p>{truck.cabType}</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={vehicle.images[0] || '/placeholder-vehicle.jpg'}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {vehicle.images.slice(1).map((image, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1">
                <img
                  src={image}
                  alt={`${vehicle.make} ${vehicle.model} - View ${index + 2}`}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-2xl font-bold text-blue-600 mb-6">
            ${vehicle.price.toLocaleString()}
          </p>

          {/* Basic Details */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <h3 className="font-semibold">Mileage</h3>
              <p>{vehicle.mileage.toLocaleString()} km</p>
            </div>
            <div>
              <h3 className="font-semibold">Fuel Type</h3>
              <p>{vehicle.fuelType}</p>
            </div>
            <div>
              <h3 className="font-semibold">Transmission</h3>
              <p>{vehicle.transmission}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p>{vehicle.location.city}, {vehicle.location.country}</p>
            </div>
          </div>

          {/* Vehicle Type Specific Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            {renderVehicleSpecificDetails(vehicle)}
          </div>

          {/* Features */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Features</h2>
            <div className="grid grid-cols-2 gap-2">
              {(vehicle as any).features?.map((feature: string, index: number) => (
                <div key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Button */}
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
} 