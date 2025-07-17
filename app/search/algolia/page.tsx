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
import { MapPin, Car, PoundSterling, Clock, Gauge, Tag, Shield, Star, ChevronDown, ChevronUp, X, Share2, CheckSquare, Square } from "lucide-react";
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
    <section className="border-t border-gray-100 py-2">
      <button
        className="flex items-center justify-between w-full text-left py-2 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-medium text-gray-900">{icon}{title}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-2 pl-2">{children}</div>}
    </section>
  );
}

function AlgoliaFilterSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { refine: clearAll } = useClearRefinements();
  return (
    <aside className={`w-full lg:w-72 shrink-0 mb-6 lg:mb-0 transition-all duration-300 ${isOpen ? "block" : "hidden lg:block"}`}>
      <div className="sticky top-6">
        <div className="p-4 bg-white rounded shadow">
          <header className="mb-3 flex items-center justify-between">
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
          <div className="space-y-2">
            <CollapsibleSection title="Type" icon={<Car className="h-4 w-4 text-blue-600" /> } defaultOpen>
              <RefinementList attribute="type" />
            </CollapsibleSection>
            <CollapsibleSection title="Make" icon={<Tag className="h-4 w-4 text-blue-600" /> } defaultOpen>
              <RefinementList attribute="make" searchable />
            </CollapsibleSection>
            <CollapsibleSection title="Model" icon={<Tag className="h-4 w-4 text-blue-600" /> } defaultOpen>
              <RefinementList attribute="model" searchable />
            </CollapsibleSection>
            <CollapsibleSection title="Price" icon={<PoundSterling className="h-4 w-4 text-blue-600" /> } defaultOpen>
              <RangeInput attribute="price" />
            </CollapsibleSection>
            <CollapsibleSection title="Year" icon={<Clock className="h-4 w-4 text-blue-600" /> } defaultOpen>
              <RangeInput attribute="year" />
            </CollapsibleSection>
            <CollapsibleSection title="Mileage" icon={<Gauge className="h-4 w-4 text-blue-600" /> } defaultOpen>
              <RangeInput attribute="mileage" />
            </CollapsibleSection>
            <CollapsibleSection title="Fuel" icon={<Gauge className="h-4 w-4 text-blue-600" /> } >
              <RefinementList attribute="fuelType" />
            </CollapsibleSection>
            <CollapsibleSection title="Transmission" icon={<Gauge className="h-4 w-4 text-blue-600" /> } >
              <RefinementList attribute="transmission" />
            </CollapsibleSection>
            <CollapsibleSection title="Body Style" icon={<Tag className="h-4 w-4 text-blue-600" /> } >
              <RefinementList attribute="bodyStyle" />
            </CollapsibleSection>
            <CollapsibleSection title="Color" icon={<Tag className="h-4 w-4 text-blue-600" /> } >
              <RefinementList attribute="color" />
            </CollapsibleSection>
            <CollapsibleSection title="Features" icon={<Star className="h-4 w-4 text-blue-600" /> } >
              <RefinementList attribute="features" />
            </CollapsibleSection>
            <CollapsibleSection title="Safety Rating" icon={<Shield className="h-4 w-4 text-blue-600" /> } >
              <RefinementList attribute="safetyRating" />
            </CollapsibleSection>
            <CollapsibleSection title="Dealer Rating" icon={<Star className="h-4 w-4 text-blue-600" /> } >
              <RefinementList attribute="dealerRating" />
            </CollapsibleSection>
          </div>
          <Button variant="outline" className="w-full mt-4 sticky bottom-0" onClick={onClose}>Close Filters</Button>
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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        <div className="font-semibold mb-2">Share this vehicle</div>
        <input className="w-full border rounded p-2 mb-2" value={url} readOnly onFocus={e => e.target.select()} />
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

function EnhancedSearchBox(props: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");
  const { recent, addSearch } = useRecentSearches();
  useEffect(() => { if (!focused && inputRef.current) inputRef.current.blur(); }, [focused]);
  return (
    <div className={`relative transition-all ${focused ? "ring-2 ring-blue-400" : ""}`}> 
      <SearchBox
        {...props}
        classNames={{ input: "w-full p-2 border rounded pr-8" }}
        inputRef={inputRef}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
        onSubmit={() => { if (value) addSearch(value); }}
      />
      {value && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          onClick={() => {
            setValue("");
            if (inputRef.current) inputRef.current.value = "";
            inputRef.current?.dispatchEvent(new Event('input', { bubbles: true }));
          }}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {focused && recent.length > 0 && (
        <div className="absolute left-0 right-0 top-full bg-white border rounded shadow z-10 mt-1">
          <div className="text-xs text-gray-500 px-3 pt-2 pb-1">Recent searches</div>
          {recent.map((q, i) => (
            <button key={i} className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm" onClick={() => {
              setValue(q);
              if (inputRef.current) inputRef.current.value = q;
              inputRef.current?.dispatchEvent(new Event('input', { bubbles: true }));
            }}>{q}</button>
          ))}
        </div>
      )}
    </div>
  );
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
      <div className="text-center py-16 text-gray-500">
        <div className="text-2xl mb-2">No results found</div>
        <div className="mb-4">Try adjusting your filters or search terms.</div>
      </div>
    );
  }

  return (
    <section className={`${view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8" : "space-y-4 sm:space-y-8"} transition-all`}>
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
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center text-gray-400 h-64">
                {`No data found in Firebase for objectID: ${hit.objectID}`}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function AlgoliaPagination() {
  const { pages, currentRefinement, nbPages, refine } = usePagination();
  return (
    <div className="flex items-center justify-between mt-8">
      <div className="text-sm text-gray-600">
        Page {currentRefinement + 1} of {nbPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentRefinement === 0}
          onClick={() => refine(currentRefinement - 1)}
          className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentRefinement === nbPages - 1}
          onClick={() => refine(currentRefinement + 1)}
          className="flex items-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
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
        select: "bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all duration-200 hover:bg-gray-100 min-w-[120px]",
      }}
    />
  );
}

function PageSizeSelector({ pageSize, setPageSize }: { pageSize: number; setPageSize: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Show</span>
      <select
        value={pageSize}
        onChange={e => setPageSize(Number(e.target.value))}
        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
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
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-lg shadow-md text-sm z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Your Location</span>
      </div>
        <div className="flex items-center gap-2 mt-1">
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
  const [pageSize, setPageSize] = useState(12);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const { compareIds, toggleCompare } = useCompare();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <Suspense fallback={<Loading />}>
          <InstantSearch
            searchClient={searchClient}
            indexName={ALGOLIA_INDEX}
            routing={true}
          >
            <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar column (map above filter sidebar) */}
                <div className="w-full lg:w-72 shrink-0 mb-6 lg:mb-0 transition-all duration-300">
                  <div className="mb-6">
                    <AlgoliaMapSection highlightedId={highlightedId} setHighlightedId={setHighlightedId} />
                  </div>
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
                  <AlgoliaFilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
                </div>
                {/* Main content */}
                <main className="flex-1 min-w-0">
                  {/* View and Sort controls */}
                  <div className="sticky top-4 z-20 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* View toggle */}
                    <div className="hidden sm:flex items-center space-x-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "grid" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                      >
                        <Grid className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Grid</span>
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`flex items-center transition-all duration-200 hover:scale-105 ${viewMode === "list" ? "bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700" : ""}`}
                      >
                        <List className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">List</span>
                      </Button>
                    </div>
                    {/* Sort dropdown and stats only (no page size here) */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                      <div className="flex items-center">
                        <label htmlFor="sort" className="text-sm font-medium mr-3 hidden sm:inline">Sort by:</label>
                        <AlgoliaSort />
                      </div>
                      <AlgoliaStats />
                    </div>
                  </div>
                  {/* Search box */}
                  <div className="mb-6">
                    <EnhancedSearchBox placeholder="Search by keyword, make, or model..." />
                  </div>
                  {/* Page size selector - moved here */}
                  <div className="mb-4 flex justify-end">
                    <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
                  </div>
                  {/* Vehicle listings */}
                  <AlgoliaHits view={viewMode} compareIds={compareIds} toggleCompare={toggleCompare} highlightedId={highlightedId} setHighlightedId={setHighlightedId} />
                  {/* Pagination */}
                  <AlgoliaPagination />
                </main>
              </div>
            </div>
          </InstantSearch>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}