"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Tag, Loader2, TrendingUp } from 'lucide-react';
import { searchWithAlgoliaKeywords } from '@/lib/search/searchServices';
import { VehicleSummary } from '@/types/vehicles';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'make' | 'model' | 'keyword';
  count?: number;
}

export function EnhancedHeroSearch() {
  const router = useRouter();
  const [keywords, setKeywords] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentVehicleSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Popular search suggestions (you can make this dynamic)
  const popularSearches = [
    { id: '1', text: 'BMW 3 Series', type: 'model' as const, count: 124 },
    { id: '2', text: 'Mercedes', type: 'make' as const, count: 89 },
    { id: '3', text: 'Tesla Model 3', type: 'model' as const, count: 67 },
    { id: '4', text: 'Audi', type: 'make' as const, count: 98 },
    { id: '5', text: 'electric car', type: 'keyword' as const, count: 45 },
  ];

  // Handle search suggestions
  const generateSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    // Show popular searches that match the input
    const filtered = popularSearches.filter(item =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add recent searches that match
    const matchingRecent = recentSearches
      .filter(search => search.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'keyword' as const
      }));

    setSuggestions([...matchingRecent.slice(0, 3), ...filtered.slice(0, 5)]);
  }, [recentSearches]);

  // Debounced suggestion generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keywords && showSuggestions) {
        generateSuggestions(keywords);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keywords, showSuggestions, generateSuggestions]);

  // Handle input focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (!keywords) {
      // Show recent searches when focusing empty input
      const recentSuggestions = recentSearches.slice(0, 5).map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'keyword' as const
      }));
      setSuggestions(recentSuggestions);
    }
  };

  // Handle input blur
  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't hide suggestions if clicking on a suggestion
    if (suggestionsRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setTimeout(() => setShowSuggestions(false), 150);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setKeywords(suggestion.text);
    setShowSuggestions(false);
    performSearch(suggestion.text);
  };

  // Add to recent searches
  const addToRecentSearches = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentVehicleSearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Perform search
  const performSearch = useCallback(async (searchKeywords?: string) => {
    const searchTerm = searchKeywords || keywords;
    
    if (!searchTerm.trim()) {
      // If no keywords, go to filter-based search
      router.push('/search');
      return;
    }

    setIsSearching(true);
    
    try {
      // Add to recent searches
      addToRecentSearches(searchTerm);

      // Create search params
      const params = new URLSearchParams();
      params.set('q', searchTerm);

      // Navigate to search page with keyword
      router.push(`/search?${params.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [keywords, router, addToRecentSearches]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[85rem] overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-blue-600 to-red-700 shadow-xl">
      <div className="flex min-h-[400px] flex-col lg:flex-row rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-filter backdrop-blur-xl">
        
        {/* Search Section */}
        <div className="flex w-full flex-col justify-between p-4 sm:p-6 lg:w-1/2 bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-r-none order-2 lg:order-1">
          <div>
            <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl font-semibold text-white">
              Find Your Perfect Vehicle
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Keywords Input with Suggestions */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Tag className="h-4 sm:h-5 w-4 sm:w-5 text-blue-200" />
                </div>
                <Input
                  ref={inputRef}
                  placeholder="Search by make, model, or keywords..."
                  className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl border-none bg-white/10 pl-10 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-white/60 focus:ring-2 focus:ring-white/40"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  disabled={isSearching}
                />

                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
                  >
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {suggestion.type === 'keyword' ? (
                            <Search className="h-4 w-4 text-gray-400" />
                          ) : suggestion.type === 'make' ? (
                            <Tag className="h-4 w-4 text-blue-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-gray-900">{suggestion.text}</span>
                          {suggestion.count && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.count}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                disabled={isSearching}
                className="h-10 sm:h-12 w-full rounded-xl sm:rounded-2xl bg-white/20 text-sm sm:text-base text-white hover:bg-white/30 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                    Search Vehicles
                  </>
                )}
              </Button>
            </form>

            {/* Quick Search Options */}
            {!keywords && recentSearches.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-white/70 mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setKeywords(search);
                        performSearch(search);
                      }}
                      className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded-full hover:bg-white/20 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between text-sm">
              <Button 
                variant="outline" 
                type="button"
                className="rounded-full bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/70 hover:bg-white/10 hover:text-white border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                onClick={() => {
                  setKeywords('');
                }}
              >
                Clear
              </Button>
              <Button 
                variant="outline" 
                type="button"
                className="rounded-full bg-white/5 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/70 hover:bg-white/10 hover:text-white border-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                onClick={() => router.push('/search')}
              >
                Advanced Search
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="relative flex w-full items-center justify-center h-[250px] sm:h-[300px] lg:h-auto rounded-2xl p-4 sm:p-6 lg:w-1/2 lg:rounded-l-none overflow-hidden order-1 lg:order-2">
          <div
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('/banner_prop/prop1.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 1,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/20 p-4 sm:p-6 text-white lg:rounded-l-none">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                Your Next Vehicle
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                Awaits Discovery
              </p>
              {isSearching && (
                <div className="mt-4 flex items-center justify-center gap-2 text-white/80">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching thousands of vehicles...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
