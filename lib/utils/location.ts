// Utility functions for location-based operations

/**
 * Validates UK postcode format
 */
export function validateUKPostcode(postcode: string): boolean {
  // UK postcode regex pattern
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
  return ukPostcodeRegex.test(postcode.trim());
}

/**
 * Formats UK postcode to standard format (uppercase with space)
 */
export function formatUKPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  if (cleaned.length >= 5) {
    return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`;
  }
  return cleaned;
}

/**
 * Convert UK postcode to coordinates using Google Maps Geocoding API
 */
export async function postcodeToCoordinates(postcode: string): Promise<{
  latitude: number;
  longitude: number;
  formattedAddress?: string;
} | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyC2ZcchDTnVTUMSnCXUSdQo7YgdcmVV8DY";
    const formattedPostcode = formatUKPostcode(postcode);
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formattedPostcode)}&region=UK&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch geocoding data');
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: data.results[0].formatted_address
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error converting postcode to coordinates:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter vehicles by location within specified radius
 */
export function filterVehiclesByLocation<T extends { location: { coordinates?: { latitude: number; longitude: number } } }>(
  vehicles: T[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): T[] {
  return vehicles.filter(vehicle => {
    if (!vehicle.location.coordinates) {
      return false;
    }
    
    const distance = calculateDistance(
      centerLat,
      centerLng,
      vehicle.location.coordinates.latitude,
      vehicle.location.coordinates.longitude
    );
    
    return distance <= radiusKm;
  });
}
