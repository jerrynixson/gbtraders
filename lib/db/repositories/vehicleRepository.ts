import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { BaseRepository } from '../repository';
import { Vehicle, VehicleFilter, VehicleSummary } from '../../../types/vehicles';

export class VehicleRepository extends BaseRepository<Vehicle> {
  protected collectionName = 'vehicles';

  async findSummaries(filter: VehicleFilter = {}, page = 1, pageSize = 20): Promise<VehicleSummary[]> {
    const constraints: QueryConstraint[] = [];
    const offset = (page - 1) * pageSize;

    // Apply filters
    if (filter.type) {
      constraints.push(where('type', '==', filter.type));
    }
    if (filter.make) {
      constraints.push(where('make', '==', filter.make));
    }
    if (filter.model) {
      constraints.push(where('model', '==', filter.model));
    }
    if (filter.minYear) {
      constraints.push(where('year', '>=', filter.minYear));
    }
    if (filter.maxYear) {
      constraints.push(where('year', '<=', filter.maxYear));
    }
    if (filter.minPrice) {
      constraints.push(where('price', '>=', filter.minPrice));
    }
    if (filter.maxPrice) {
      constraints.push(where('price', '<=', filter.maxPrice));
    }
    if (filter.fuelType) {
      constraints.push(where('fuelType', '==', filter.fuelType));
    }
    if (filter.transmission) {
      constraints.push(where('transmission', '==', filter.transmission));
    }
    if (filter.location?.city) {
      constraints.push(where('location.city', '==', filter.location.city));
    }
    if (filter.location?.country) {
      constraints.push(where('location.country', '==', filter.location.country));
    }

    // Add default ordering by createdAt
    constraints.push(orderBy('createdAt', 'desc'));

    const vehicles = await this.findAll(constraints);

    // Manual pagination since Firestore doesn't support offset
    return vehicles
      .slice(offset, offset + pageSize)
      .map(vehicle => ({
        id: vehicle.id,
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        images: vehicle.images,
        location: vehicle.location,
        registrationNumber: vehicle.registrationNumber,
        fuelType: vehicle.fuelType,
        image: vehicle.images[0] || '/placeholder-vehicle.jpg' // Add first image or placeholder
      }));
  }

  async findByIdWithType<T extends Vehicle>(id: string): Promise<T | null> {
    const vehicle = await this.findById(id);
    return vehicle as T | null;
  }

  async findByDealerId(dealerId: string, page = 1, pageSize = 20): Promise<VehicleSummary[]> {
    const constraints = [
      where('dealerUid', '==', dealerId),
      orderBy('createdAt', 'desc')
    ];

    const vehicles = await this.findAll(constraints);

    return vehicles
      .slice((page - 1) * pageSize, page * pageSize)
      .map(vehicle => ({
        id: vehicle.id,
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        images: vehicle.images,
        location: vehicle.location,
        registrationNumber: vehicle.registrationNumber,
        fuelType: vehicle.fuelType,
        image: vehicle.images[0] || '/placeholder-vehicle.jpg' // Add first image or placeholder
      }));
  }

  async searchByMakeModel(searchTerm: string, limit = 10): Promise<VehicleSummary[]> {
    const makeConstraints = [
      where('make', '>=', searchTerm),
      where('make', '<=', searchTerm + '\uf8ff'),
      orderBy('make'),
    ];

    const modelConstraints = [
      where('model', '>=', searchTerm),
      where('model', '<=', searchTerm + '\uf8ff'),
      orderBy('model'),
    ];

    const [makeResults, modelResults] = await Promise.all([
      this.findAll(makeConstraints),
      this.findAll(modelConstraints)
    ]);

    // Combine and deduplicate results
    const combinedResults = [...makeResults, ...modelResults];
    const uniqueResults = Array.from(new Map(combinedResults.map(v => [v.id, v])).values());

    return uniqueResults
      .slice(0, limit)
      .map(vehicle => ({
        id: vehicle.id,
        type: vehicle.type,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        images: vehicle.images,
        location: vehicle.location,
        registrationNumber: vehicle.registrationNumber,
        fuelType: vehicle.fuelType,
        image: vehicle.images[0] || '/placeholder-vehicle.jpg' // Add first image or placeholder
      }));
  }

  async getMakes(): Promise<string[]> {
    const constraints = [orderBy('make')];
    const vehicles = await this.findAll(constraints);
    return Array.from(new Set(vehicles.map(v => v.make)));
  }

  async getModels(make: string): Promise<string[]> {
    const constraints = [
      where('make', '==', make),
      orderBy('model')
    ];
    const vehicles = await this.findAll(constraints);
    return Array.from(new Set(vehicles.map(v => v.model)));
  }

  // Method to create a vehicle with authenticated dealer
  async createVehicle(data: Omit<Vehicle, 'id' | 'dealerUid'>, dealerUid: string): Promise<Vehicle> {
    return this.create({
      ...data,
      dealerUid,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Omit<Vehicle, 'id'>);
  }

  // Method to ensure dealer owns vehicle before update/delete
  private async verifyDealerOwnership(vehicleId: string, dealerUid: string): Promise<boolean> {
    const vehicle = await this.findById(vehicleId);
    return vehicle?.dealerUid === dealerUid;
  }

  // Override update method to check ownership
  async updateVehicle(id: string, data: Partial<Vehicle>, dealerUid: string): Promise<void> {
    const hasAccess = await this.verifyDealerOwnership(id, dealerUid);
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have permission to modify this vehicle');
    }
    return this.update(id, data);
  }

  // Override delete method to check ownership
  async deleteVehicle(id: string, dealerUid: string): Promise<void> {
    const hasAccess = await this.verifyDealerOwnership(id, dealerUid);
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have permission to delete this vehicle');
    }
    return this.delete(id);
  }
} 