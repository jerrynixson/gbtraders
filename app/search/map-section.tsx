"use client";

import { useState, useEffect } from 'react';
import { GoogleMapComponent } from '@/components/ui/google-map';
import { VehicleSummary } from '@/types/vehicles';

interface MapSectionProps {
  vehicles?: VehicleSummary[];
}

export function MapSection({ vehicles = [] }: MapSectionProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const calculateCenter = () => {
    if (!userLocation && vehicles.length === 0) {
      return { lat: 51.5074, lng: -0.1278 }; // Default to London
    }

    if (!userLocation) {
      const firstVehicle = vehicles[0];
      if (!firstVehicle?.location?.coordinates) {
        return { lat: 51.5074, lng: -0.1278 }; // Default to London
      }
      return {
        lat: firstVehicle.location.coordinates.latitude,
        lng: firstVehicle.location.coordinates.longitude,
      };
    }

    if (vehicles.length === 0) {
      return userLocation;
    }

    // Calculate center point between user and vehicles
    const validVehicles = vehicles.filter(v => v.location?.coordinates);
    if (validVehicles.length === 0) {
      return userLocation;
    }

    const latSum = userLocation.lat + validVehicles.reduce((sum, v) => sum + v.location.coordinates.latitude, 0);
    const lngSum = userLocation.lng + validVehicles.reduce((sum, v) => sum + v.location.coordinates.longitude, 0);
    const count = validVehicles.length + 1;

    return {
      lat: latSum / count,
      lng: lngSum / count,
    };
  };

  const markers = [
    ...(userLocation
      ? [
          {
            position: userLocation,
            title: "Your Location",
            icon: {
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            },
          },
        ]
      : []),
    ...vehicles
      .filter(vehicle => vehicle.location?.coordinates)
      .map((vehicle) => ({
        position: {
          lat: vehicle.location.coordinates.latitude,
          lng: vehicle.location.coordinates.longitude,
        },
        title: `${vehicle.make} ${vehicle.model}`,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      })),
  ];

  return (
    <div className="relative">
      <div className="h-[300px] rounded-xl overflow-hidden">
        <GoogleMapComponent
          center={calculateCenter()}
          zoom={12}
          markers={markers}
        />
      </div>
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md text-sm">
        <div className="flex items-center gap-2">
          <img
            src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            alt="User location"
            className="w-4 h-4"
          />
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <img
            src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            alt="Vehicle location"
            className="w-4 h-4"
          />
          <span>Vehicle Location</span>
        </div>
      </div>
    </div>
  );
} 