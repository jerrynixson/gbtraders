"use client";
import { Suspense, useState } from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  SearchBox,
  RefinementList,
  RangeInput,
  useHits,
  usePagination,
  useStats,
  useClearRefinements,
  SortBy,
  useSearchBox,
} from "react-instantsearch-hooks-web";
import Loading from "@/app/loading";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MapSection } from "../map-section";
import { Button } from "@/components/ui/button";
import { Grid, List, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { VehicleCard } from "@/components/vehicle-card";
import { useEffect, useRef } from "react";
import { MapPin, Car, PoundSterling, Clock, Gauge, Tag, Shield, Star, ChevronDown, ChevronUp, X, Share2, CheckSquare, Square, Search as SearchIcon } from "lucide-react";
import { VehicleRepository } from '@/lib/db/repositories/vehicleRepository';

// Use env variables for Algolia credentials
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "";
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY || "";
const ALGOLIA_INDEX = process.env.NEXT_PUBLIC_ALGOLIA_VEHICLES_INDEX || "vehicles";

// Debug logging (remove in production)
console.log("Algolia Config:", {
  appId: ALGOLIA_APP_ID ? `${ALGOLIA_APP_ID.substring(0, 3)}...` : "NOT SET",
  searchKey: ALGOLIA_SEARCH_KEY ? `${ALGOLIA_SEARCH_KEY.substring(0, 3)}...` : "NOT SET", 
  index: ALGOLIA_INDEX
});

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

function CollapsibleSection({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-t border-gray-100 py-1">
      <button
        className="flex items-center justify-between w-full text-left py-1 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-medium text-gray-900">{icon}{title}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-1 pl-2">{children}</div>}
    </section>
  );
}

function AlgoliaFilterSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { refine: clearAll } = useClearRefinements();
  return (
    <aside className={`w-full lg:w-72 shrink-0 mb-6 lg:mb-0 transition-all duration-300 ${isOpen ? "block" : "hidden lg:block"}`}>
      <div className="sticky top-6">
        <div className="p-2 bg-white rounded shadow">
          <header className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <Button
              variant="outline"
              className="flex items-center text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs px-2 py-1"
              onClick={clearAll}
              aria-label="Reset all filters"
            >
              <RotateCcw className="h-3 w-3 mr-1" aria-hidden="true" />
              Reset
            </Button>
          </header>
          <div className="space-y-1">
            <CollapsibleSection title="Type" icon={<Car className="h-4 w-4 text-blue-600" />} defaultOpen>
              <RefinementList attribute="type" />
            </CollapsibleSection>
            <CollapsibleSection title="Make" icon={<Tag className="h-4 w-4 text-blue-600" />} defaultOpen>
              <RefinementList attribute="make" searchable />
            </CollapsibleSection>
            <CollapsibleSection title="Model" icon={<Tag className="h-4 w-4 text-blue-600" />} defaultOpen>
              <RefinementList attribute="model" searchable />
            </CollapsibleSection>
            <CollapsibleSection title="Price" icon={<PoundSterling className="h-4 w-4 text-blue-600" />} defaultOpen>
              <RangeInput attribute="price" />
            </CollapsibleSection>
            <CollapsibleSection title="Year" icon={<Clock className="h-4 w-4 text-blue-600" />} defaultOpen>
              <RangeInput attribute="year" />
            </CollapsibleSection>
            <CollapsibleSection title="Mileage" icon={<Gauge className="h-4 w-4 text-blue-600" />} defaultOpen>
              <RangeInput attribute="mileage" />
            </CollapsibleSection>
            <CollapsibleSection title="Fuel" icon={<Gauge className="h-4 w-4 text-blue-600" />} >
              <RefinementList attribute="fuelType" />
            </CollapsibleSection>
            <CollapsibleSection title="Transmission" icon={<Gauge className="h-4 w-4 text-blue-600" />} >
              <RefinementList attribute="transmission" />
            </CollapsibleSection>
            <CollapsibleSection title="Body Style" icon={<Tag className="h-4 w-4 text-blue-600" />} >
              <RefinementList attribute="bodyStyle" />
            </CollapsibleSection>
            <CollapsibleSection title="Color" icon={<Tag className="h-4 w-4 text-blue-600" />} >
              <RefinementList attribute="color" />
            </CollapsibleSection>
            <CollapsibleSection title="Features" icon={<Star className="h-4 w-4 text-blue-600" />} >
              <RefinementList attribute="features" />
            </CollapsibleSection>
            <CollapsibleSection title="Safety Rating" icon={<Shield className="h-4 w-4 text-blue-600" />} >
              <RefinementList attribute="safetyRating" />
            </CollapsibleSection>
            <CollapsibleSection title="Dealer Rating" icon={<Star className="h-4 w-4 text-blue-600" />} >
              <RefinementList attribute="dealerRating" />
            </CollapsibleSection>
          </div>
          <Button variant="outline" className="w-full mt-2 sticky bottom-0" onClick={onClose}>Close Filters</Button>
        </div>
      </div>
    </aside>
  );
}

// --- Compare State (in-memory for now) ---
function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const toggleCompare = (id: string) => {
    setCompareIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  return { compareIds, toggleCompare };
}

// --- Share Modal ---
function ShareModal({ open, onClose, url }: { open: boolean; onClose: () => void; url: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        <div className="font-semibold mb-1">Share this vehicle</div>
        <input className="w-full border rounded p-2 mb-1" value={url} readOnly onFocus={e => e.target.select()} />
        <button className="w-full bg-blue-700 text-white rounded p-2 font-medium" onClick={() => {navigator.clipboard.writeText(url); onClose();}}>Copy Link</button>
      </div>
    </div>
  );
}

// --- Enhanced VehicleCard Wrapper ---
function EnhancedVehicleCard({ vehicle, view, compareIds, toggleCompare }: any) {
  const [shareOpen, setShareOpen] = useState(false);
  // Badge logic
  let badge = null;
  if (vehicle.status === "sold") badge = <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">Sold</span>;
  else if (vehicle.featured) badge = <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold">Featured</span>;
  else if (vehicle.isNew) badge = <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">New</span>;
  // Compare logic
  const isCompared = compareIds.includes(vehicle.id);
  // Share logic
  const url = typeof window !== "undefined" ? `${window.location.origin}/vehicle-info/${vehicle.id}` : "";
  return (
    <div className="relative group">
      {badge && <div className="absolute top-2 left-2 z-10">{badge}</div>}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button onClick={() => toggleCompare(vehicle.id)} aria-label="Compare" className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all duration-200 hover:scale-110">
          {isCompared ? <CheckSquare className="h-4 w-4 text-blue-700" /> : <Square className="h-4 w-4 text-gray-700" />}
        </button>
        <button onClick={() => setShareOpen(true)} aria-label="Share" className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all duration-200 hover:scale-110">
          <Share2 className="h-4 w-4 text-gray-700" />
        </button>
      </div>
      <VehicleCard vehicle={vehicle} view={view} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} url={url} />
    </div>
  );
}

// --- Recent Searches ---
function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) setRecent(JSON.parse(stored));
  }, []);
  const addSearch = (q: string) => {
    setRecent(prev => {
      const updated = [q, ...prev.filter(x => x !== q)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };
  return { recent, addSearch };
}

// Update EnhancedSearchBox for consistent pill shape and shadow
function EnhancedSearchBox({ value, setValue, ...props }: { value: string; setValue: (v: string) => void; [key: string]: any }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="relative w-full">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
        <SearchIcon className="h-5 w-5" />
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="w-full pl-11 pr-10 py-1 border border-gray-200 rounded-full bg-white shadow focus:ring-2 focus:ring-blue-400 transition-all duration-200 min-w-[200px] max-w-5xl text-base placeholder-gray-400"
        placeholder="Search by keyword, make, or model..."
        aria-label="Search vehicles"
        {...props}
      />
      {value && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
          onClick={() => {
            setValue("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ConnectedSearchBox: must be rendered inside <InstantSearch>
function ConnectedSearchBox({ mobile }: { mobile?: boolean }) {
  const { query, refine } = useSearchBox();
  return <EnhancedSearchBox value={query} setValue={refine} />;
}

function AlgoliaHits({ view, compareIds, toggleCompare, highlightedId, setHighlightedId }: any) {
  const { hits } = useHits();
  const [vehicles, setVehicles] = useState<{ [id: string]: any }>({});
  const repoRef = useRef<VehicleRepository>();
  if (!repoRef.current) repoRef.current = new VehicleRepository();

  useEffect(() => {
    async function fetchVehicles() {
      const newVehicles: { [id: string]: any } = {};
      await Promise.all(
        hits.map(async (hit: any) => {
          if (!vehicles[hit.objectID]) {
            const data = await repoRef.current!.getVehicleById(hit.objectID);
            console.log("Fetched from Firebase:", hit.objectID, data);
            if (data) newVehicles[hit.objectID] = data;
          }
        })
      );
      if (Object.keys(newVehicles).length > 0) {
        setVehicles((prev) => ({ ...prev, ...newVehicles }));
      }
    }
    if (hits.length > 0) fetchVehicles();
    // eslint-disable-next-line
  }, [hits.map((h: any) => h.objectID).join(",")]);

  if (hits.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <div className="text-2xl mb-1">No results found</div>
        <div className="mb-2">Try adjusting your filters or search terms.</div>
      </div>
    );
  }

  return (
    <section className={`${view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4" : "space-y-2 sm:space-y-4"} transition-all`}>
      {hits.map((hit: any) => {
        const vehicle = vehicles[hit.objectID];
        return (
          <div key={hit.objectID} onMouseEnter={() => setHighlightedId(hit.objectID)} onMouseLeave={() => setHighlightedId(null)}>
            {vehicle ? (
              <EnhancedVehicleCard
                vehicle={vehicle}
                view={view}
                compareIds={compareIds}
                toggleCompare={toggleCompare}
              />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center text-gray-400 h-64">
                {`No data found in Firebase for objectID: ${hit.objectID}`}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function AlgoliaPaginationWithPageSize({ pageSize, setPageSize }: { pageSize: number; setPageSize: (n: number) => void }) {
  const { pages, currentRefinement, nbPages, refine } = usePagination();
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-2 gap-2">
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600">
          Page {currentRefinement + 1} of {nbPages}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentRefinement === 0}
            onClick={() => refine(currentRefinement - 1)}
            className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 py-1 px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentRefinement === nbPages - 1}
            onClick={() => refine(currentRefinement + 1)}
            className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 py-1 px-2"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
    </div>
  );
}

function AlgoliaStats() {
  const { nbHits } = useStats();
  return (
    <div className="hidden sm:block text-sm text-gray-600 whitespace-nowrap">
      {nbHits.toLocaleString()} vehicles found
    </div>
  );
}

function AlgoliaSort() {
  // You must configure Algolia replicas for sorting to work
  // See: https://www.algolia.com/doc/guides/managing-results/refine-results/sorting/
  return (
    <SortBy
      items={[
        { label: "Newest First", value: ALGOLIA_INDEX },
        { label: "Oldest First", value: `${ALGOLIA_INDEX}_oldest` },
        { label: "Price: Low to High", value: `${ALGOLIA_INDEX}_price_asc` },
        { label: "Price: High to Low", value: `${ALGOLIA_INDEX}_price_desc` },
        { label: "Mileage: Low to High", value: `${ALGOLIA_INDEX}_mileage_asc` },
        { label: "Mileage: High to Low", value: `${ALGOLIA_INDEX}_mileage_desc` },
        { label: "Year: Newest First", value: `${ALGOLIA_INDEX}_year_desc` },
        { label: "Year: Oldest First", value: `${ALGOLIA_INDEX}_year_asc` },
      ]}
      classNames={{
        select: "bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px] max-w-[200px]",
      }}
    />
  );
}

function PageSizeSelector({ pageSize, setPageSize }: { pageSize: number; setPageSize: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-600">Show</span>
      <select
        value={pageSize}
        onChange={e => setPageSize(Number(e.target.value))}
        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1"
      >
        {[12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <span className="text-sm text-gray-600">per page</span>
      </div>
  );
}

// --- Map Section with Highlight ---
function AlgoliaMapSection({ highlightedId, setHighlightedId }: { highlightedId: string | null, setHighlightedId: (id: string | null) => void }) {
  const { hits } = useHits();
  const vehicles = hits.map((hit: any) => ({
    id: hit.objectID,
    type: hit.type || "car",
    make: hit.make,
    model: hit.model,
    year: hit.year,
    price: hit.price,
    monthlyPrice: hit.monthlyPrice,
    mileage: hit.mileage,
    fuel: hit.fuelType,
    transmission: hit.transmission,
    color: hit.color || "",
    registrationNumber: hit.registrationNumber,
    location: hit.location || { address: "", city: "", country: "", coordinates: undefined },
    mainImage: hit.mainImage || (hit.imageUrls?.[0] ?? "/placeholder.svg"),
    imageUrls: hit.imageUrls,
    status: hit.status,
    featured: hit.featured,
    isNew: hit.isNew,
  }));
  return (
    <div className="relative">
      <MapSection vehicles={vehicles} />
      <div className="absolute bottom-4 left-4 bg-white p-1 rounded-lg shadow-md text-sm z-10">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Your Location</span>
      </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Car className="w-4 h-4 text-red-600" />
          <span>Vehicle Location</span>
      </div>
      </div>
      </div>
  );
}

export default function AlgoliaSearchPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // NEW
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false); // NEW
  const [pageSize, setPageSize] = useState(12);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const { compareIds, toggleCompare } = useCompare();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* 2. Sticky search bar on mobile */}
      <div className="block sm:hidden sticky top-0 z-30 bg-white px-2 py-1 border-b border-gray-100">
        {/* ConnectedSearchBox must be inside <InstantSearch> context, so render a placeholder here and move the real one below */}
      </div>
      <div className="flex-1 bg-gray-50">
        <Suspense fallback={<Loading />}>
          <InstantSearch
            searchClient={searchClient}
            indexName={ALGOLIA_INDEX}
            routing={true}
          >
            <div className="container mx-auto py-4 px-2 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Sidebar column (map above filter sidebar) */}
                <div className="w-full lg:w-72 shrink-0 mb-1 lg:mb-0 transition-all duration-300">
                  {/* 3. Hide map section on mobile, show button to open modal */}
                  <div className="mb-0">
                    <div className="hidden sm:block">
                      <AlgoliaMapSection highlightedId={highlightedId} setHighlightedId={setHighlightedId} />
                    </div>
                    {/* Mobile: Show Map and Filters buttons closer together */}
                    <div className="block sm:hidden w-full mb-0">
                      <div className="flex flex-row gap-1 justify-between items-center">
                        <Button
                          className="flex-1 bg-gradient-to-r from-blue-800 to-blue-600 text-white py-1 min-w-0 text-sm"
                          onClick={() => setIsMobileMapOpen(true)}
                        >
                          Show Map
                        </Button>
                        <Button
                          onClick={() => setIsMobileFilterOpen(true)}
                          className="flex-1 bg-gradient-to-r from-blue-800 to-blue-600 text-white py-1 min-w-0 text-sm"
                        >
                          Filters
                        </Button>
                      </div>
                    </div>
                    {/* Mobile Map Modal */}
                    {isMobileMapOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="relative w-full h-full flex flex-col">
                          <div className="flex-1 bg-white overflow-auto">
                            <AlgoliaMapSection highlightedId={highlightedId} setHighlightedId={setHighlightedId} />
                          </div>
                          <Button className="w-full rounded-none bg-blue-700 text-white" onClick={() => setIsMobileMapOpen(false)}>
                            Close Map
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* 4. Hide filter sidebar on mobile, show floating button */}
                  <div className="hidden lg:block">
                    <AlgoliaFilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
                  </div>
                  {/* Mobile Filter Modal */}
                  {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                      <div className="relative w-full h-full flex flex-col">
                        <div className="flex-1 bg-white overflow-auto p-2">
                          <AlgoliaFilterSidebar isOpen={true} onClose={() => setIsMobileFilterOpen(false)} />
                        </div>
                        <Button className="w-full rounded-none bg-blue-700 text-white" onClick={() => setIsMobileFilterOpen(false)}>
                          Close Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Main content */}
                <main className="flex-1 min-w-0">
                  {/* Mobile search bar inside InstantSearch context */}
                  <div className="block sm:hidden mb-2">
                    <ConnectedSearchBox />
                  </div>
                  {/* 5. Controls row: stack vertically on mobile, hide grid/list toggle */}
                  <div className="sticky top-4 z-20 bg-white/95 border border-gray-100 rounded-2xl shadow-lg p-1 mb-1 sm:p-3 sm:mb-4">
                    <div className="flex flex-col gap-1 w-full sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: View toggle and search */}
                      <div className="flex flex-col gap-1 w-full md:w-auto sm:flex-row sm:items-center">
                        {/* Hide grid/list toggle on mobile */}
                        <div className="hidden sm:flex items-center gap-2">
                          <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            aria-label="Grid view"
                            onClick={() => setViewMode("grid")}
                            className={`rounded-full px-4 py-2 font-semibold shadow-sm border transition-all duration-200 focus:ring-2 focus:ring-blue-400 ${viewMode === "grid" ? "bg-gradient-to-r from-blue-800 to-blue-600 text-white border-blue-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                          >
                            <Grid className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Grid</span>
                          </Button>
                          <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="sm"
                            aria-label="List view"
                            onClick={() => setViewMode("list")}
                            className={`rounded-full px-4 py-2 font-semibold shadow-sm border transition-all duration-200 focus:ring-2 focus:ring-blue-400 ${viewMode === "list" ? "bg-gradient-to-r from-blue-800 to-blue-600 text-white border-blue-700" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                          >
                            <List className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">List</span>
                          </Button>
                        </div>
                        {/* Hide search box here on mobile, it's sticky at top */}
                        <div className="hidden sm:flex flex-1 items-center">
                          <ConnectedSearchBox />
                        </div>
                      </div>
                      {/* Right: Sort and stats */}
                      <div className="flex items-center gap-1 w-full md:w-auto justify-end">
                        <div className="flex items-center">
                          <label htmlFor="sort" className="text-sm font-medium mr-2 hidden sm:inline">Sort by:</label>
                          <SortBy
                            items={[
                              { label: "Newest First", value: ALGOLIA_INDEX },
                              { label: "Oldest First", value: `${ALGOLIA_INDEX}_oldest` },
                              { label: "Price: Low to High", value: `${ALGOLIA_INDEX}_price_asc` },
                              { label: "Price: High to Low", value: `${ALGOLIA_INDEX}_price_desc` },
                              { label: "Mileage: Low to High", value: `${ALGOLIA_INDEX}_mileage_asc` },
                              { label: "Mileage: High to Low", value: `${ALGOLIA_INDEX}_mileage_desc` },
                              { label: "Year: Newest First", value: `${ALGOLIA_INDEX}_year_desc` },
                              { label: "Year: Oldest First", value: `${ALGOLIA_INDEX}_year_asc` },
                            ]}
                            classNames={{
                              select: "bg-white border border-gray-200 text-gray-900 text-sm rounded-full shadow focus:ring-2 focus:ring-blue-400 p-2 transition-all duration-200 hover:bg-gray-100 min-w-[120px] max-w-[200px]",
                            }}
                            aria-label="Sort vehicles"
                          />
                        </div>
                        <AlgoliaStats />
                      </div>
                    </div>
                  </div>
                  {/* 6. Vehicle listings: force single column on mobile */}
                  <AlgoliaHits
                    view={viewMode}
                    compareIds={compareIds}
                    toggleCompare={toggleCompare}
                    highlightedId={highlightedId}
                    setHighlightedId={setHighlightedId}
                  />
                  {/* 7. Pagination: replace with Load More button on mobile */}
                  <div className="block sm:hidden mt-3">
                    <Button className="w-full bg-blue-700 text-white py-2 text-base font-semibold rounded-full">Load More</Button>
                  </div>
                  <div className="hidden sm:block">
                    <AlgoliaPaginationWithPageSize pageSize={pageSize} setPageSize={setPageSize} />
                  </div>
                </main>
              </div>
            </div>
          </InstantSearch>
        </Suspense>
      </div>
      {/* 8. Floating Filters Button (bottom right) for mobile */}
      <div className="fixed bottom-2 right-2 z-40 sm:hidden">
        <Button
          className="rounded-full bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg px-3 py-2 text-base font-semibold min-w-0"
          onClick={() => setIsMobileFilterOpen(true)}
        >
          Filters
        </Button>
      </div>
      <Footer />
    </div>
  );
}