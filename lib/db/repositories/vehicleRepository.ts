import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, QueryConstraint, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/db/firebase';
import { Vehicle, VehicleType, VehicleFilters, VehicleQueryOptions, VehicleQueryResult, VehicleSummary, BaseVehicle } from '@/types/vehicles';

export class VehicleRepository {
  private collection = collection(db, 'vehicles');

  /**
   * Convert Firestore document to Vehicle type
   */
  private convertToVehicle(doc: QueryDocumentSnapshot<DocumentData>): Vehicle {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      mot: data.mot ? {
        ...data.mot,
        expiryDate: data.mot.expiryDate?.toDate(),
        history: data.mot.history?.map((entry: any) => ({
          ...entry,
          date: entry.date?.toDate()
        }))
      } : undefined
    } as Vehicle;
  }

  /**
   * Convert Vehicle to VehicleSummary
   */
  convertToSummary(vehicle: Vehicle): VehicleSummary {
    return {
      id: vehicle.id,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      monthlyPrice: vehicle.monthlyPrice,
      mileage: vehicle.mileage,
      fuel: vehicle.fuel,
      transmission: vehicle.transmission,
      color: vehicle.color,
      registrationNumber: vehicle.registrationNumber,
      location: vehicle.location,
      mainImage: vehicle.images?.[0] || vehicle.imageUrls?.[0] || '/placeholder.svg',
      imageUrls: vehicle.imageUrls || vehicle.images,
    };
  }

  /**
   * Build query constraints from filters
   */
  private buildQueryConstraints(filters: VehicleFilters): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    // Type filter (required)
    constraints.push(where('type', '==', filters.type));

    // Optional filters
    if (filters.make?.length) {
      // For make, we'll use a case-insensitive comparison
      constraints.push(where('make', '>=', filters.make[0].toLowerCase()));
      constraints.push(where('make', '<=', filters.make[0].toLowerCase() + '\uf8ff'));
    }

    if (filters.model?.length) {
      // For model, we'll use a case-insensitive comparison
      constraints.push(where('model', '>=', filters.model[0].toLowerCase()));
      constraints.push(where('model', '<=', filters.model[0].toLowerCase() + '\uf8ff'));
    }

    if (filters.minPrice !== undefined) {
      constraints.push(where('price', '>=', filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }

    if (filters.minYear !== undefined) {
      constraints.push(where('year', '>=', filters.minYear));
    }

    if (filters.maxYear !== undefined) {
      constraints.push(where('year', '<=', filters.maxYear));
    }

    if (filters.minMileage !== undefined) {
      constraints.push(where('mileage', '>=', filters.minMileage));
    }

    if (filters.maxMileage !== undefined) {
      constraints.push(where('mileage', '<=', filters.maxMileage));
    }

    if (filters.fuelType?.length) {
      constraints.push(where('fuel', 'in', filters.fuelType));
    }

    if (filters.transmission?.length) {
      constraints.push(where('transmission', 'in', filters.transmission));
    }

    if (filters.bodyStyle?.length) {
      constraints.push(where('bodyStyle', 'in', filters.bodyStyle));
    }

    return constraints;
  }

  /**
   * Search vehicles with filters and pagination
   */
  async searchVehicles(
    filters: VehicleFilters,
    options: { page?: number; limit?: number } = {}
  ): Promise<VehicleQueryResult<VehicleSummary>> {
    const { page = 1, limit: pageSize = 12 } = options;
    const constraints = this.buildQueryConstraints(filters);
    
    // Add pagination
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(pageSize));

    if (page > 1) {
      // Get the last document from the previous page
      const lastDoc = await this.getLastDocumentFromPage(filters, page - 1, pageSize);
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
    }

    const q = query(this.collection, ...constraints);
    const snapshot = await getDocs(q);
    
    let vehicles = snapshot.docs.map(doc => this.convertToVehicle(doc));

    // If we have a make filter, perform case-insensitive partial matching
    if (filters.make?.length) {
      const searchTerm = filters.make[0].toLowerCase();
      vehicles = vehicles.filter(vehicle => 
        vehicle.make.toLowerCase().includes(searchTerm)
      );
    }

    const summaries = vehicles.map(vehicle => this.convertToSummary(vehicle));

    return {
      items: summaries,
      total: vehicles.length,
      page,
      limit: pageSize,
      hasMore: vehicles.length === pageSize,
    };
  }

  /**
   * Get the last document from a specific page
   */
  private async getLastDocumentFromPage(
    filters: VehicleFilters,
    page: number,
    pageLimit: number
  ): Promise<QueryDocumentSnapshot<DocumentData> | null> {
    const constraints = this.buildQueryConstraints(filters);
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(page * pageLimit));

    const q = query(this.collection, ...constraints);
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    return docs.length > 0 ? docs[docs.length - 1] : null;
  }

  /**
   * Get available makes for a vehicle type
   */
  async getAvailableMakes(type: VehicleType): Promise<string[]> {
    const q = query(
      this.collection,
      where('type', '==', type),
      orderBy('make', 'asc')
    );

    const snapshot = await getDocs(q);
    const makes = new Set<string>();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.make) {
        makes.add(data.make);
      }
    });

    return Array.from(makes);
  }

  /**
   * Get available models for a vehicle type and make
   */
  async getAvailableModels(type: VehicleType, make: string): Promise<string[]> {
    const q = query(
      this.collection,
      where('type', '==', type),
      where('make', '==', make),
      orderBy('model', 'asc')
    );

    const snapshot = await getDocs(q);
    const models = new Set<string>();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.model) {
        models.add(data.model);
      }
    });

    return Array.from(models);
  }

  /**
   * Get a single vehicle by ID
   */
  async getVehicle(id: string): Promise<Vehicle | null> {
    const docRef = doc(this.collection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.convertToVehicle(docSnap as QueryDocumentSnapshot<DocumentData>);
  }

  /**
   * Get a single vehicle by ID
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const vehicleDoc = await getDoc(doc(this.collection, id));
      if (vehicleDoc.exists()) {
        return this.convertToVehicle(vehicleDoc as QueryDocumentSnapshot<DocumentData>);
      }
      return null;
    } catch (error) {
      console.error('Error getting vehicle by ID:', error);
      return null;
    }
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const now = new Date();
    const data = {
      ...vehicle,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(this.collection, data);
    const docSnap = await getDoc(docRef);

    return this.convertToVehicle(docSnap as QueryDocumentSnapshot<DocumentData>);
  }

  /**
   * Update an existing vehicle
   */
  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    const docRef = doc(this.collection, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(id: string): Promise<void> {
    const docRef = doc(this.collection, id);
    await deleteDoc(docRef);
  }

  /**
   * Get all vehicles by dealer ID
   */
  async getVehiclesByDealerId(dealerId: string): Promise<Vehicle[]> {
    const q = query(
      this.collection,
      where('dealerUid', '==', dealerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => this.convertToVehicle(doc));
  }

  /**
   * Get all vehicles from Firestore (for local filtering)
   */
  async getAllVehicles(): Promise<VehicleSummary[]> {
    try {
      const q = query(
        this.collection,
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const vehicles = snapshot.docs.map(doc => this.convertToVehicle(doc));
      return vehicles.map(vehicle => this.convertToSummary(vehicle));
    } catch (error) {
      console.error('Error getting all vehicles:', error);
      return [];
    }
  }
} 