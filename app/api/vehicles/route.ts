import { NextRequest, NextResponse } from 'next/server';
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';
import { VehicleFilters, VehicleType } from '@/types/vehicles';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filters: VehicleFilters = {
    type: (searchParams.get('type') as VehicleType) || 'car',
    make: searchParams.getAll('make'),
    model: searchParams.getAll('model'),
    minPrice: searchParams.has('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.has('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    minYear: searchParams.has('minYear')
      ? Number(searchParams.get('minYear'))
      : undefined,
    maxYear: searchParams.has('maxYear')
      ? Number(searchParams.get('maxYear'))
      : undefined,
    minMileage: searchParams.has('minMileage')
      ? Number(searchParams.get('minMileage'))
      : undefined,
    maxMileage: searchParams.has('maxMileage')
      ? Number(searchParams.get('maxMileage'))
      : undefined,
    fuelType: searchParams.getAll('fuelType') as any,
    transmission: searchParams.getAll('transmission') as any,
    bodyStyle: searchParams.getAll('bodyStyle') as any,
  };

  const page = searchParams.has('page')
    ? Number(searchParams.get('page'))
    : 1;
  const limit = searchParams.has('limit')
    ? Number(searchParams.get('limit'))
    : 12;

  const vehicleRepo = new VehicleRepository();

  try {
    const featuredVehicles = await vehicleRepo.searchVehicles(
      { ...filters, type: 'car' },
      { page: 1, limit: 4 }
    );
    const newArrivals = await vehicleRepo.searchVehicles(
      { ...filters, type: 'car' },
      { page: 1, limit: 4 }
    );

    return NextResponse.json({
      success: true,
      data: {
        featuredVehicles: featuredVehicles.items,
        newArrivals: newArrivals.items,
      },
    });
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
} 