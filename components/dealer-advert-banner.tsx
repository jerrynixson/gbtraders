"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, InfoIcon } from 'lucide-react';

// Define the banner data type
export interface BannerData {
  id: number;
  vehicle: string;
  title: string;
  description: string;
  detailedDescription: string;
  dealerInfo: {
    name: string;
    location: string;
    rating: number;
    specialties: string[];
  };
  contactNumber: string;
}

// Props interface for the component
interface CarRentalBannerProps {
  banners?: BannerData[]; // Optional prop to allow custom banners
  autoScrollInterval?: number; // Optional prop to customize auto-scroll interval
}

// Default banner data (you can replace these with your actual images)
const defaultBannerData: BannerData[] = [
  {
    id: 1,
    vehicle: '/Dealers/dealer1.jpg', // Ensure these images are in your public folder
    title: 'SPEED INTO SAVINGS!',
    description: 'Velocity Motors',
    detailedDescription: 'At Velocity Motors, we bring you the fastest, most stylish, and performance-packed cars at unmatched prices. Whether youre looking for a muscle car, SUV, or luxury sedan, we’ve got the perfect ride for you!',
    dealerInfo: {
      name: 'Velocity Motors',
      location: 'Downtown City Center',
      rating: 4.5,
      specialties: ['Luxury Cars', 'SUVs', 'Weekend Specials']
    },
    contactNumber: '234-342-56.45'
  },
  {
    id: 2,
    vehicle: '/Dealers/dealer2.jpg', // Ensure these images are in your public folder
    title: 'BIG CARS. BIGGER DEALS!',
    description: 'Titan Auto Hub',
    detailedDescription: 'Looking for power, durability, and a deal you can’t resist? At Titan Auto Hub, we bring you the strongest and most reliable vehicles at the best prices. Whether it\'s an SUV, truck, or sports car, we make sure you drive away with confidence!',
    dealerInfo: {
      name: 'Titan Auto Hub',
      location: 'Uptown District',
      rating: 4.8,
      specialties: ['Sports Cars', 'Convertibles', 'Premium Service']
    },
    contactNumber: '234-342-56.46'
  }
];

const CarRentalBanner: React.FC<CarRentalBannerProps> = ({ 
  banners = defaultBannerData, 
  autoScrollInterval = 5000 
}) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle next banner
  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  // Handle previous banner
  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Open dealer info modal
  const openDealerModal = () => {
    setIsModalOpen(true);
  };

  // Close dealer info modal
  const closeDealerModal = () => {
    setIsModalOpen(false);
  };

  // Auto-scroll effect
  useEffect(() => {
    const intervalId = setInterval(nextBanner, autoScrollInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentBanner, autoScrollInterval]);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Banner Container */}
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        {/* Current Banner */}
        <div 
          key={banners[currentBanner].id} 
          className="flex items-center bg-white text-blue-900 h-[350px]"
        >
          <div className="w-1/2 h-full flex items-center justify-center p-4 relative">
            <Image 
              src={banners[currentBanner].vehicle} 
              alt="Rental Vehicle"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <div className="w-1/2 h-full flex flex-col justify-center p-6 bg-gradient-to-r from-blue-600 to-red-600 text-white">
            <div className="text-sm uppercase tracking-wide text-blue-200 mb-2">
              {banners[currentBanner].title}
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {banners[currentBanner].description}
            </h2>
            
            <div className="text-sm mb-4 text-white/80">
              {banners[currentBanner].detailedDescription}
            </div>
            
            <button 
              onClick={openDealerModal}
              className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 
                         inline-flex items-center px-4 py-2 rounded mb-4 text-sm font-semibold"
            >
              <InfoIcon size={16} className="mr-2" />
              Learn More About Dealer
            </button>
            
            <div className="flex items-center text-sm">
              <span className="mr-3 text-white/80">Contact Us:</span>
              <span className="font-bold text-white">
                {banners[currentBanner].contactNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={prevBanner} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 
                     text-blue-600/50 hover:text-blue-600 transition-all duration-300 
                     bg-transparent hover:bg-blue-100 rounded-full p-2"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={nextBanner} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 
                     text-blue-600/50 hover:text-blue-600 transition-all duration-300 
                     bg-transparent hover:bg-blue-100 rounded-full p-2"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dealer Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">
                {banners[currentBanner].dealerInfo.name}
              </h2>
              <button 
                onClick={closeDealerModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Location:</p>
                <p className="text-blue-900">
                  {banners[currentBanner].dealerInfo.location}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-semibold">Rating:</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-xl ${
                        i < Math.floor(banners[currentBanner].dealerInfo.rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-gray-600">
                    ({banners[currentBanner].dealerInfo.rating})
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 font-semibold">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {banners[currentBanner].dealerInfo.specialties.map((specialty) => (
                    <span 
                      key={specialty}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarRentalBanner;