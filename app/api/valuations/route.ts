import { NextRequest, NextResponse } from 'next/server';

interface ValuationRequest {
  reg: string;
  mileage: number;
}

interface OneAutoResponse {
  result?: {
    valuation_data?: {
      trade_retail?: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ValuationRequest = await request.json();

    // Validate required fields
    if (!body.reg || body.mileage === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: reg and mileage' },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof body.reg !== 'string' || typeof body.mileage !== 'number') {
      return NextResponse.json(
        { error: 'Invalid field types: reg must be string, mileage must be number' },
        { status: 400 }
      );
    }

    // Validate mileage is non-negative
    if (body.mileage < 0) {
      return NextResponse.json(
        { error: 'Mileage must be a non-negative number' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.oneauto_key;
    if (!apiKey) {
      console.error('oneauto_key environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Build the One Auto API URL
    const url = new URL('https://api.oneautoapi.com/ukvehicledata/valuationfromvrm/v2');
    url.searchParams.append('vehicle_registration_mark', body.reg);
    url.searchParams.append('current_mileage', body.mileage.toString());

    // Call One Auto API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`One Auto API error: ${response.status} - ${errorText}`);
      
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: 'API authentication failed' },
          { status: 401 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch valuation data' },
        { status: response.status }
      );
    }

    // Parse response
    const data: OneAutoResponse = await response.json();

    // Extract trade_retail value
    const tradeRetail = data.result?.valuation_data?.trade_retail;

    if (tradeRetail === undefined) {
      console.error('trade_retail value not found in API response', data);
      return NextResponse.json(
        { error: 'Invalid response from valuation API' },
        { status: 500 }
      );
    }

    // Return only the trade_retail value
    return NextResponse.json(
      { trade_retail: tradeRetail },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.error('Valuation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
