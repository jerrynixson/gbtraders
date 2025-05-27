"use client";

import { useState, useCallback, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { VehicleType, VehicleFilters, VehicleQueryResult, VehicleSummary } from '@/types/vehicles';
import { FilterSidebar } from '@/components/search/filter-sidebar';
import { VehicleCard } from '@/components/vehicle-card';
import { Button } from '@/components/ui/button';
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { MapSection } from './map-section';

interface ClientPageProps {
  initialVehicles: VehicleQueryResult<VehicleSummary>;
  availableMakes: string[];
  availableModels: string[];
  selectedVehicleType: VehicleType;
  initialFilters: VehicleFilters;
  view: 'grid' | 'list';
  page: number;
  sort: string;
}

export default function ClientPage({
  initialVehicles,
  availableMakes,
  availableModels,
  selectedVehicleType,
  initialFilters,
  view: initialView,
  page: initialPage,
  sort: initialSort,
}: ClientPageProps) {
  // Router
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialView);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update URL with new parameters
  const updateSearchParams = useCallback((updates: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams(window.location.search);

    // Update or remove parameters
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
    });

    // Update URL
    startTransition(() => {
      router.push(`${pathname}?${searchParams.toString()}`);
    });
  }, [pathname, router]);

  // Handle view mode change
  const handleViewChange = useCallback((newView: 'grid' | 'list') => {
    setViewMode(newView);
    updateSearchParams({ view: newView });
  }, [updateSearchParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((filters: VehicleFilters) => {
    const updates: Record<string, string | undefined> = {
      type: filters.type,
      make: filters.make?.[0],
      model: filters.model?.[0],
      minPrice: filters.minPrice?.toString(),
      maxPrice: filters.maxPrice?.toString(),
      minYear: filters.minYear?.toString(),
      maxYear: filters.maxYear?.toString(),
      minMileage: filters.minMileage?.toString(),
      maxMileage: filters.maxMileage?.toString(),
      fuel: filters.fuelType?.[0],
      transmission: filters.transmission?.[0],
      bodyStyle: filters.bodyStyle?.[0],
      page: '1', // Reset to first page when filters change
    };

    updateSearchParams(updates);
  }, [updateSearchParams]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: string) => {
    updateSearchParams({ sort: newSort, page: '1' });
  }, [updateSearchParams]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateSearchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden w-full mb-4">
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700"
              >
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {/* Sidebar */}
            <aside className={`w-full lg:w-72 shrink-0 mb-6 lg:mb-0 transition-all duration-300 ${
              isFilterOpen ? "block" : "hidden lg:block"
            }`}>
              <div className="sticky top-6">
                <MapSection vehicles={initialVehicles.items} />
                <FilterSidebar
                  initialFilters={initialFilters}
                  onFilterChange={handleFilterChange}
                  availableMakes={availableMakes}
                  availableModels={availableModels}
                  selectedVehicleType={selectedVehicleType}
                />
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              {/* View and Sort controls */}
              <div className="sticky top-4 z-20 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* View toggle */}
                <div className="hidden sm:flex items-center space-x-2">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleViewChange("grid")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "grid" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Grid</span>
                  </Button>
                  <Button 
                    variant={viewMode === "list" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => handleViewChange("list")}
                    className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "list" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                  >
                    <List className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">List</span>
                  </Button>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="flex items-center">
                    <label htmlFor="sort" className="text-sm font-medium mr-3 hidden sm:inline">Sort by:</label>
                    <select 
                      id="sort"
                      value={initialSort}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px]"
                    >
                      <option value="createdAt:desc">Newest First</option>
                      <option value="createdAt:asc">Oldest First</option>
                      <option value="price:asc">Price: Low to High</option>
                      <option value="price:desc">Price: High to Low</option>
                      <option value="mileage:asc">Mileage: Low to High</option>
                      <option value="mileage:desc">Mileage: High to Low</option>
                      <option value="year:desc">Year: Newest First</option>
                      <option value="year:asc">Year: Oldest First</option>
                    </select>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-600 whitespace-nowrap">
                    {initialVehicles.total.toLocaleString()} vehicles found
                  </div>
                </div>
              </div>

              {/* Vehicle listings */}
              <section className={`${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8" : "space-y-4 sm:space-y-8"} transition-all`}> 
                {initialVehicles.items.map(vehicle => (
                  <VehicleCard 
                    key={vehicle.id}
                    vehicle={vehicle}
                    view={viewMode}
                  />
                ))}
              </section>

              {/* Pagination */}
              {initialVehicles.totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600">
                    Page {initialPage} of {initialVehicles.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={initialPage === 1 || isPending}
                      onClick={() => handlePageChange(initialPage - 1)}
                      className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={initialPage === initialVehicles.totalPages || isPending}
                      onClick={() => handlePageChange(initialPage + 1)}
                      className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 