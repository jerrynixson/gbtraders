"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MapSection } from '@/app/search/map-section';
import { VehicleCard } from '@/components/vehicle-card';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Filter, X, MapPin, Car, AlertCircle } from 'lucide-react';
import { VehicleSummary, VehicleFilters, VehicleType } from '@/types/vehicles';
import {
  searchWithAlgoliaKeywords,
  fetchVehiclesFromFirestoreCached,
  applyLocalFilters,
  sortVehiclesLocally,
  paginateLocally,
  convertVehicleFiltersToFilterOptions,
  type FilterOptions,
  type SortOptions,
  type PaginationOptions
} from '@/lib/search/searchServices';

interface EnhancedSearchPageProps {
  initialVehicles?: VehicleSummary[];
  availableMakes?: string[];
  availableModels?: string[];
  selectedVehicleType?: VehicleType;
  initialFilters?: VehicleFilters;
  view?: 'grid' | 'list';
  page?: number;
  sort?: string;
}

export default function EnhancedSearchPage({
  initialVehicles = [],
  availableMakes = [],
  availableModels = [],
  selectedVehicleType = 'car',
  initialFilters = {}, // No default type - show all vehicles initially
  view = 'grid',
  page = 1,
  sort = 'createdAt:desc'
}: EnhancedSearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [vehicles, setVehicles] = useState<VehicleSummary[]>(initialVehicles);
  const [allVehicles, setAllVehicles] = useState<VehicleSummary[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<VehicleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFlow, setSearchFlow] = useState<'keyword' | 'filter'>('filter');
  
  // Dynamic makes and models state
  const [currentAvailableMakes, setCurrentAvailableMakes] = useState<string[]>(availableMakes);
  const [currentAvailableModels, setCurrentAvailableModels] = useState<string[]>(availableModels);

  // Initialize makes and models from props (if any)
  useEffect(() => {
    if (availableMakes.length > 0) {
      setCurrentAvailableMakes(availableMakes);
    }
    if (availableModels.length > 0) {
      setCurrentAvailableModels(availableModels);
    }
  }, [availableMakes, availableModels]);
  
  // UI State
  const [currentView, setCurrentView] = useState<'grid' | 'list'>(view);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(12);
  
  // Filter and sort state
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'price',
    direction: 'asc'
  });

  // Get keyword from URL params
  const keyword = searchParams?.get('q') || '';
  const isKeywordSearch = Boolean(keyword);

  // Determine search flow based on presence of keyword
  useEffect(() => {
    setSearchFlow(isKeywordSearch ? 'keyword' : 'filter');
  }, [isKeywordSearch]);

  // 🔍 Flow 1: Keyword Search (Hero -> Algolia -> Firestore)
  const performKeywordSearch = useCallback(async (searchKeyword: string) => {
    if (!searchKeyword.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchWithAlgoliaKeywords(searchKeyword);
      setVehicles(results);
      setFilteredVehicles(results);
    } catch (err) {
      setError('Failed to search vehicles. Please try again.');
      console.error('Keyword search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update available makes and models based on current filters and data
  const updateAvailableMakesAndModels = useCallback((currentFilters: VehicleFilters, vehicleData: VehicleSummary[]) => {
    if (vehicleData.length === 0) {
      // If no vehicle data, keep existing makes/models from props
      return;
    }

    // Get available makes based on current type filter
    let filteredForMakes = vehicleData;
    if (currentFilters.type) {
      filteredForMakes = vehicleData.filter(v => v.type === currentFilters.type);
    }
    
    const makesSet = new Set<string>();
    filteredForMakes.forEach(vehicle => {
      if (vehicle.make && vehicle.make.trim()) {
        makesSet.add(vehicle.make.trim());
      }
    });
    const sortedMakes = Array.from(makesSet).sort();
    setCurrentAvailableMakes(sortedMakes);

    // Get available models based on current type and make filters
    let filteredForModels = vehicleData;
    if (currentFilters.type) {
      filteredForModels = filteredForModels.filter(v => v.type === currentFilters.type);
    }
    if (currentFilters.make?.length) {
      filteredForModels = filteredForModels.filter(v => 
        currentFilters.make!.some(make => 
          v.make && v.make.toLowerCase().includes(make.toLowerCase())
        )
      );
    }
    
    const modelsSet = new Set<string>();
    filteredForModels.forEach(vehicle => {
      if (vehicle.model && vehicle.model.trim()) {
        modelsSet.add(vehicle.model.trim());
      }
    });
    const sortedModels = Array.from(modelsSet).sort();
    setCurrentAvailableModels(sortedModels);
  }, []);

  // 🔍 Flow 2: Filter Search (Local Filtering)
  const loadAllVehiclesForFiltering = useCallback(async () => {
    if (allVehicles.length > 0) return; // Already loaded
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await fetchVehiclesFromFirestoreCached();
      setAllVehicles(results);
      setVehicles(results);
      setFilteredVehicles(results);
    } catch (err) {
      setError('Failed to load vehicles. Please try again.');
      console.error('Load vehicles error:', err);
    } finally {
      setLoading(false);
    }
  }, [allVehicles.length]);

  // Apply local filters
  const applyFilters = useCallback((newFilters: VehicleFilters) => {
    const filterOptions = convertVehicleFiltersToFilterOptions(newFilters);
    const baseVehicles = searchFlow === 'keyword' ? vehicles : allVehicles;
    const filtered = applyLocalFilters(baseVehicles, filterOptions);
    setFilteredVehicles(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    
    // Update available makes and models based on the new filters
    updateAvailableMakesAndModels(newFilters, baseVehicles);
  }, [vehicles, allVehicles, searchFlow, updateAvailableMakesAndModels]);

  // Sort vehicles
  const sortedVehicles = useMemo(() => {
    return sortVehiclesLocally(filteredVehicles, sortOptions);
  }, [filteredVehicles, sortOptions]);

  // Paginate vehicles
  const paginationResult = useMemo(() => {
    return paginateLocally(sortedVehicles, currentPage, pageSize);
  }, [sortedVehicles, currentPage, pageSize]);

  // Update makes and models when vehicle data changes
  useEffect(() => {
    const vehicleData = searchFlow === 'keyword' ? vehicles : allVehicles;
    if (vehicleData.length > 0) {
      updateAvailableMakesAndModels(filters, vehicleData);
    } else if (initialVehicles.length > 0 && currentAvailableMakes.length === 0) {
      // If no cached data yet but we have initial vehicles, use them
      updateAvailableMakesAndModels(filters, initialVehicles);
    }
  }, [vehicles, allVehicles, filters, searchFlow, updateAvailableMakesAndModels, initialVehicles, currentAvailableMakes.length]);

  // Initialize search based on flow
  useEffect(() => {
    if (searchFlow === 'keyword' && keyword) {
      performKeywordSearch(keyword);
    } else if (searchFlow === 'filter') {
      loadAllVehiclesForFiltering();
    }
  }, [searchFlow, keyword, performKeywordSearch, loadAllVehiclesForFiltering]);

  // Apply filters when they change
  useEffect(() => {
    applyFilters(filters);
  }, [filters, applyFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: VehicleFilters) => {
    setFilters(newFilters);
    
    // Update URL with new filters (for deep linking)
    const params = new URLSearchParams(searchParams?.toString());
    
    // Clear existing filter params
    ['make', 'model', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'fuel', 'transmission', 'type'].forEach(key => {
      params.delete(key);
    });
    
    // Add new filter params
    if (newFilters.make?.length) params.set('make', newFilters.make[0]);
    if (newFilters.model?.length) params.set('model', newFilters.model[0]);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.minYear) params.set('minYear', newFilters.minYear.toString());
    if (newFilters.maxYear) params.set('maxYear', newFilters.maxYear.toString());
    if (newFilters.fuelType?.length) params.set('fuel', newFilters.fuelType.join(','));
    if (newFilters.transmission?.length) params.set('transmission', newFilters.transmission.join(','));
    if (newFilters.type) params.set('type', newFilters.type);
    
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Handle sort changes
  const handleSortChange = useCallback((value: string) => {
    const [field, direction] = value.split(':') as [SortOptions['field'], SortOptions['direction']];
    setSortOptions({ field, direction });
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Loading skeleton
  const renderSkeleton = () => (
    <div className={`${currentView === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
      {Array.from({ length: pageSize }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      ))}
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto py-4 px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Sidebar column (map above filter sidebar) */}
            <div className="w-full lg:w-80 shrink-0 mb-1 lg:mb-0 transition-all duration-300">
              {/* Map Section */}
              <div className="mb-6">
                <div className="hidden lg:block">
                  <MapSection vehicles={paginationResult.items} />
                </div>
                {/* Medium and Mobile: Show Map and Filters buttons */}
                <div className="block lg:hidden w-full mb-4">
                  <div className="flex flex-row gap-2 justify-between items-center">
                    <Button
                      className="flex-1 bg-gradient-to-r from-blue-800 to-blue-600 text-white py-2 min-w-0 text-sm"
                      onClick={() => setShowMobileMap(true)}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Show Map
                    </Button>
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex-1 bg-gradient-to-r from-blue-800 to-blue-600 text-white py-2 min-w-0 text-sm"
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      Filters
                    </Button>
                  </div>
                </div>
                {/* Map Modal for Medium and Mobile screens */}
                {showMobileMap && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="relative w-full h-full flex flex-col">
                      <div className="flex-1 bg-white overflow-auto">
                        <MapSection vehicles={paginationResult.items} />
                      </div>
                      <Button 
                        className="w-full rounded-none bg-blue-700 text-white" 
                        onClick={() => setShowMobileMap(false)}
                      >
                        Close Map
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Sidebar - Only visible on large screens */}
              <div className="hidden lg:block">
                <FilterSidebar
                  initialFilters={filters}
                  onFilterChange={handleFilterChange}
                  availableMakes={currentAvailableMakes}
                  availableModels={currentAvailableModels}
                  selectedVehicleType={selectedVehicleType}
                />
              </div>

              {/* Filter Modal for Medium and Mobile screens */}
              {showFilters && (
                <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="relative w-full h-full flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Search Filters</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="p-1 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Modal Content */}
                    <div className="flex-1 bg-white overflow-auto p-4">
                      <FilterSidebar
                        initialFilters={filters}
                        onFilterChange={handleFilterChange}
                        availableMakes={currentAvailableMakes}
                        availableModels={currentAvailableModels}
                        selectedVehicleType={selectedVehicleType}
                      />
                    </div>
                    
                    {/* Modal Footer */}
                    <div className="bg-white p-4 border-t border-gray-200">
                      <Button 
                        className="w-full bg-blue-700 text-white hover:bg-blue-800" 
                        onClick={() => setShowFilters(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Results Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {keyword ? `Search results for "${keyword}"` : 'Vehicle Search'}
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-gray-600">
                        {loading ? 'Loading...' : `${paginationResult.totalItems} vehicles found`}
                      </p>
                      {searchFlow === 'keyword' && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          <Car className="h-3 w-3 mr-1" />
                          Keyword Search
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* View Toggle & Sort */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Filter button for medium screens (tablet/narrow desktop) */}
                    {/**
                    <div className="lg:hidden">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(true)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Filter className="h-4 w-4 mr-1" />
                        Filters
                      </Button>
                    </div>
                    */}

                    {/*
                    <div className="flex border rounded-lg">
                      <Button
                        variant={currentView === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentView('grid')}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={currentView === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentView('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    */}
                    
                    <select
                      value={`${sortOptions.field}:${sortOptions.direction}`}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="border rounded-lg px-3 py-1 text-sm w-full sm:w-auto min-w-0"
                    >
                      <option value="price:asc">Price: Low to High</option>
                      <option value="price:desc">Price: High to Low</option>
                      <option value="year:desc">Year: Newest First</option>
                      <option value="year:asc">Year: Oldest First</option>
                      <option value="mileage:asc">Mileage: Low to High</option>
                      <option value="mileage:desc">Mileage: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              {loading ? (
                renderSkeleton()
              ) : paginationResult.items.length === 0 ? (
                <Card className="p-8 text-center">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No vehicles found</h2>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilters({}); // Clear all filters including type to show all vehicles
                      if (keyword) {
                        router.push('/search');
                      }
                    }}
                  >
                    Clear All Filters
                  </Button>
                </Card>
              ) : (
                <>
                  {/* Vehicle Grid/List */}
                  <div className={`${
                    currentView === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                      : 'space-y-4'
                  }`}>
                    {paginationResult.items.map((vehicle) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        view={currentView}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {paginationResult.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!paginationResult.hasPreviousPage}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, paginationResult.totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!paginationResult.hasNextPage}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Page Size Selector */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="border rounded px-2 py-1"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                    </select>
                    <span>per page</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
