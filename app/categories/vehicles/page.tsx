"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import {
  Car,
  BusFront,
  Bike,
  Truck,
  PlugZap,
  TentTree,
  Bike as BikeIcon,
  Zap
} from 'lucide-react';

// Define types for all data structures
interface VehicleType {
  id: number;
  name: string;
  price: string;
  image: string;
  year: string;
  mileage: string;
  transmission: string;
  fuelType: string;
  location: string;
}

interface CategoryType {
  name: string;
  image: React.ReactNode;
}

interface BrandType {
  name: string;
  logo?: string;
}

// Define the component props interface
interface VehiclesPageProps {
  includeHeader?: boolean;
  includeFooter?: boolean;
  customCategories?: CategoryType[];
  customFeaturedVehicles?: VehicleType[];
  customNewArrivals?: VehicleType[];
  customBrands?: BrandType[];
}

// Reusable Vehicle Card component
const VehicleCard = ({ vehicle }: { vehicle: VehicleType }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
    <div className="relative overflow-hidden">
      <img 
        src={vehicle.image} 
        alt={vehicle.name} 
        className="w-full h-48 object-cover bg-gray-50 group-hover:scale-110 transition-transform duration-500" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors duration-200">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{vehicle.name}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {vehicle.year}
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {vehicle.mileage}
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {vehicle.transmission}
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {vehicle.fuelType}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600">{vehicle.price}</div>
        <button className="px-6 py-2 bg-gradient-to-r from-red-500 to-blue-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-blue-700 transition-colors duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
          View Details
        </button>
      </div>
    </div>
  </div>
);

// Main Vehicles component
export default function VehiclesPage({
  includeHeader = true,
  includeFooter = true,
  customCategories,
  customFeaturedVehicles,
  customNewArrivals,
  customBrands
}: VehiclesPageProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Default data
  const categories: CategoryType[] = [
    {
      name: 'Cars',
      image: <Car className={`w-8 h-8 transition-transform duration-300 ${
        selectedCategories.includes('Cars') ? 'scale-110 brightness-0 invert' : ''
      }`} size={32} strokeWidth={2} />
    },
    {
      name: 'Vans',
      image: <BusFront className={`w-8 h-8 transition-transform duration-300 ${
        selectedCategories.includes('Vans') ? 'scale-110 brightness-0 invert' : ''
      }`} size={32} strokeWidth={2} />
    },
    {
      name: 'Motorcycles',
      image: <Bike className={`w-8 h-8 transition-transform duration-300 ${
        selectedCategories.includes('Motorcycles') ? 'scale-110 brightness-0 invert' : ''
      }`} size={32} strokeWidth={2} />
    },
    {
      name: 'Trucks',
      image: <Truck className={`w-8 h-8 transition-transform duration-300 ${
        selectedCategories.includes('Trucks') ? 'scale-110 brightness-0 invert' : ''
      }`} size={32} strokeWidth={2} />
    },
    {
      name: 'Electric Vehicles',
      image: <PlugZap className={`w-8 h-8 transition-transform duration-300 ${
        selectedCategories.includes('Electric Vehicles') ? 'scale-110 brightness-0 invert' : ''
      }`} size={32} strokeWidth={2} />
    },
    {
      name: 'Caravans',
      image: <TentTree className={`w-8 h-8 transition-transform duration-300 ${
        selectedCategories.includes('Caravans') ? 'scale-110 brightness-0 invert' : ''
      }`} size={32} strokeWidth={2} />
    },
    {
      name: 'E-Bikes',
      image: (
        <div className="relative">
          <BikeIcon className={`w-8 h-8 transition-transform duration-300 ${
            selectedCategories.includes('E-Bikes') ? 'scale-110 brightness-0 invert' : ''
          }`} size={32} strokeWidth={2} />
          <Zap className="w-4 h-4 absolute -top-1 -right-1 text-yellow-500" size={16} strokeWidth={2} />
        </div>
      )
    }
  ];
  

  const featuredVehicles: VehicleType[] = customFeaturedVehicles || [
    {
      id: 1,
      name: '2021 BMW 3 Series',
      price: '£32,999',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
      year: '2021',
      mileage: '25,000 mi',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      location: 'London'
    },
    {
      id: 2,
      name: '2022 Audi Q5',
      price: '£41,999',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      year: '2022',
      mileage: '15,000 mi',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      location: 'Manchester'
    },
    {
      id: 3,
      name: '2020 Mercedes C-Class',
      price: '£28,999',
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
      year: '2020',
      mileage: '35,000 mi',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      location: 'Birmingham'
    },
    {
      id: 4,
      name: '2023 Tesla Model 3',
      price: '£45,999',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      year: '2023',
      mileage: '5,000 mi',
      transmission: 'Automatic',
      fuelType: 'Electric',
      location: 'Leeds'
    }
  ];

  const newArrivals: VehicleType[] = customNewArrivals || [
    {
      id: 5,
      name: '2023 Porsche Cayenne',
      price: '£79,999',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
      year: '2023',
      mileage: '1,000 mi',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      location: 'London'
    },
    {
      id: 6,
      name: '2022 Range Rover Sport',
      price: '£68,999',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
      year: '2022',
      mileage: '12,000 mi',
      transmission: 'Automatic',
      fuelType: 'Diesel',
      location: 'Glasgow'
    },
    {
      id: 7,
      name: '2023 BMW iX',
      price: '£72,999',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
      year: '2023',
      mileage: '500 mi',
      transmission: 'Automatic',
      fuelType: 'Electric',
      location: 'Bristol'
    },
    {
      id: 8,
      name: '2022 Audi e-tron GT',
      price: '£82,999',
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
      year: '2022',
      mileage: '8,000 mi',
      transmission: 'Automatic',
      fuelType: 'Electric',
      location: 'Manchester'
    }
  ];

  const brands: BrandType[] = customBrands || [
    { name: 'BMW' },
    { name: 'Audi' },
    { name: 'Mercedes' },
    { name: 'Tesla' },
    { name: 'Porsche' },
    { name: 'Land Rover' },
    { name: 'Volkswagen' },
    { name: 'Toyota' }
  ];

  // Sort vehicles based on selected option
  const sortVehicles = (vehicles: VehicleType[]) => {
    switch (sortOption) {
      case 'price-low-high':
        return [...vehicles].sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
      case 'price-high-low':
        return [...vehicles].sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceB - priceA;
        });
      case 'year-new-old':
        return [...vehicles].sort((a, b) => parseInt(b.year) - parseInt(a.year));
      case 'year-old-new':
        return [...vehicles].sort((a, b) => parseInt(a.year) - parseInt(b.year));
      case 'mileage-low-high':
        return [...vehicles].sort((a, b) => {
          const mileageA = parseInt(a.mileage.replace(/[^0-9]/g, ''));
          const mileageB = parseInt(b.mileage.replace(/[^0-9]/g, ''));
          return mileageA - mileageB;
        });
      default:
        return vehicles;
    }
  };

  // Filter vehicles based on search and filters
  const filterVehicles = (vehicles: VehicleType[]) => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPrice = (!priceRange.min || parseFloat(vehicle.price.replace(/[^0-9.]/g, '')) >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || parseFloat(vehicle.price.replace(/[^0-9.]/g, '')) <= parseFloat(priceRange.max));
      
      const matchesCategory = selectedCategories.length === 0 || 
                            selectedCategories.some(category => vehicle.name.toLowerCase().includes(category.toLowerCase()));
      
      const matchesBrand = selectedBrands.length === 0 || 
                          selectedBrands.some(brand => vehicle.name.toLowerCase().includes(brand.toLowerCase()));
      
      return matchesSearch && matchesPrice && matchesCategory && matchesBrand;
    });
  };

  const sortedAndFilteredFeaturedVehicles = sortVehicles(filterVehicles(featuredVehicles));
  const sortedAndFilteredNewArrivals = sortVehicles(filterVehicles(newArrivals));

  return (
    <div className="min-h-screen bg-white">
      {includeHeader && <Header />}

      {/* Vehicles Header */}
      <div className="relative mx-auto w-full max-w-[85rem] overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-blue-600 to-red-700 shadow-xl mb-12">
        <div className="flex min-h-[400px] flex-col rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-filter backdrop-blur-xl">
          <div className="container mx-auto px-4 relative z-10 py-12">
            <h1 className="text-4xl font-bold mb-6 text-center text-white">Available Vehicles</h1>
            
            {/* Enhanced Search */}
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Search by make, model, or location..." 
                    className="w-full px-6 py-4 border-0 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                <div className="relative dropdown-container">
                  <button 
                    className="px-6 py-4 border-0 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-white/20 bg-white/10 text-white backdrop-blur-sm flex items-center gap-2 hover:bg-white/20 transition-colors duration-300"
                    onClick={() => setActiveDropdown(activeDropdown === 'sort' ? null : 'sort')}
                  >
                    <span>Sort by: {sortOption.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute top-full left-0 mt-2 w-72 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                    activeDropdown === 'sort' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
                  }`}>
                    <div className="p-4">
                      <div className="flex flex-col gap-2">
                        {[
                          { value: 'relevance', label: 'Relevance' },
                          { value: 'price-low-high', label: 'Price: Low to High' },
                          { value: 'price-high-low', label: 'Price: High to Low' },
                          { value: 'year-new-old', label: 'Year: Newest First' },
                          { value: 'year-old-new', label: 'Year: Oldest First' },
                          { value: 'mileage-low-high', label: 'Mileage: Low to High' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            className={`px-4 py-2 text-left text-sm rounded-md transition-colors duration-200 ${
                              sortOption === option.value
                                ? 'bg-red-50 text-red-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setSortOption(option.value);
                              setActiveDropdown(null);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Filters */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="relative dropdown-container">
                <button 
                  className="px-6 py-3 bg-white/10 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm"
                  onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                >
                  Price Range
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute top-full left-0 mt-2 w-72 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                  activeDropdown === 'price' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
                }`}>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      />
                      <span className="text-gray-500">to</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      />
                    </div>
                    <button 
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-blue-600 text-white text-sm font-medium rounded-md hover:from-red-600 hover:to-blue-700 transition-colors duration-300"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative dropdown-container">
                <button 
                  className="px-6 py-3 bg-white/10 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm"
                  onClick={() => setActiveDropdown(activeDropdown === 'categories' ? null : 'categories')}
                >
                  Vehicle Types
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute top-full left-0 mt-2 w-72 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                  activeDropdown === 'categories' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
                }`}>
                  <div className="p-6">
                    <div className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {categories.map((category, index) => (
                          <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              checked={selectedCategories.includes(category.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, category.name]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button 
                        className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-300"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative dropdown-container">
                <button 
                  className="px-6 py-3 bg-white/10 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm"
                  onClick={() => setActiveDropdown(activeDropdown === 'brands' ? null : 'brands')}
                >
                  Brands
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute top-full left-0 mt-2 w-72 bg-white/90 backdrop-blur-xl rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                  activeDropdown === 'brands' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
                }`}>
                  <div className="p-6">
                    <div className="max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {brands.map((brand, index) => (
                          <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              checked={selectedBrands.includes(brand.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBrands([...selectedBrands, brand.name]);
                                } else {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700">{brand.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button 
                        className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-300"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Vehicle Types Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-6 flex flex-col items-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md cursor-pointer border ${
                selectedCategories.includes(category.name) 
                  ? 'ring-2 ring-red-500 scale-105 bg-red-50 shadow-lg' 
                  : 'hover:ring-1 hover:ring-blue-200 border-gray-100'
              }`}
              onClick={() => {
                if (selectedCategories.includes(category.name)) {
                  setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                } else {
                  setSelectedCategories([...selectedCategories, category.name]);
                }
              }}
            >
              <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                selectedCategories.includes(category.name) 
                  ? 'bg-gradient-to-r from-red-500 to-blue-600 scale-110' 
                  : 'bg-gray-100'
              }`}>
                {category.image}
              </div>
              <div className={`text-sm font-medium transition-colors duration-300 ${
                selectedCategories.includes(category.name) 
                  ? 'text-red-600 font-semibold' 
                  : 'text-gray-700'
              }`}>
                {category.name}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Vehicles */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            Featured Vehicles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedAndFilteredFeaturedVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>

        {/* Promotion */}
        <div className="bg-gradient-to-br from-red-500 via-blue-600 to-red-700 text-white rounded-2xl p-10 mb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Spring Sale Event</h2>
              <p className="text-lg opacity-90 max-w-xl">Get up to £2,000 off selected vehicles this spring. Plus, 0% APR financing available on approved credit.</p>
            </div>
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-white/90 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
              <span>View Offers</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Arrivals */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedAndFilteredNewArrivals.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            Shop by Brand
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6">
            {brands.map((brand, index) => (
              <div key={index} className="bg-white rounded-xl p-6 flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group border border-gray-100">
                <div className="w-full h-12 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{brand.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {includeFooter && <Footer />}
    </div>
  );
}

// Export individual components for flexible use
export { Footer, VehicleCard }; 