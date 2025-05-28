import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  // Add your production domains here
  'https://yourdomain.com'
];

export async function GET(request: Request) {
  try {
    // Check origin
    const headersList = headers();
    const origin = request.headers.get('origin');

    // Validate origin
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(null, {
        status: 403,
        statusText: 'Forbidden',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Parse URL and get search params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'car';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Get vehicles
    const vehicleRepo = new VehicleRepository();
    const result = await vehicleRepo.searchVehicles(
      { type: type as any },
      { page, limit }
    );

    // Return response with CORS headers
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');

  // Handle preflight requests
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 