"use client";

import { useLoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { useMemo } from "react";

interface GoogleMapComponentProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  height?: string;
  width?: string;
  markers?: Array<{
    position: {
      lat: number;
      lng: number;
    };
    title?: string;
    icon?: {
      url: string;
      scaledSize?: google.maps.Size;
    };
  }>;
}

const defaultCenter = {
  lat: 51.5074, // London coordinates
  lng: -0.1278,
};

const defaultZoom = 10;

export function GoogleMapComponent({
  center = defaultCenter,
  zoom = defaultZoom,
  height = "300px",
  width = "100%",
  markers = [],
}: GoogleMapComponentProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      clickableIcons: true,
      scrollwheel: true,
    }),
    []
  );

  if (!isLoaded) {
    return (
      <div
        style={{ height, width }}
        className="bg-gray-100 rounded-xl flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      zoom={zoom}
      center={center}
      mapContainerStyle={{ height, width }}
      options={mapOptions}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          title={marker.title}
          icon={marker.icon}
        />
      ))}
    </GoogleMap>
  );
} 