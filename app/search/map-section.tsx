"use client";

import { GoogleMapComponent } from '@/components/ui/google-map';

export function MapSection() {
  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden relative mb-6">
      <GoogleMapComponent />
    </div>
  );
} 