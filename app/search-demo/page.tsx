import { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { EnhancedHeroSearch } from '@/components/search/enhanced-hero-search';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Search, Filter, Zap, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enhanced Search Demo | Your Marketplace',
  description: 'Experience our new dual-flow search functionality with Algolia integration and local filtering.',
};

export default function SearchDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Search */}
        <div className="mb-12">
          <EnhancedHeroSearch />
        </div>

        {/* Features Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Enhanced Vehicle Search Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Flow 1 - Keyword Search */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Keyword Search</h3>
                  <Badge variant="secondary" className="mt-1">Flow 1</Badge>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Intelligent search using Algolia for lightning-fast results. 
                Type car names, makes, models, or any keywords to find vehicles instantly.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Full-text search across all vehicle data
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Limited to 100 results for optimal performance
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Batch fetch from Firebase for complete data
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Client-side filtering and sorting
                </div>
              </div>
            </Card>

            {/* Flow 2 - Advanced Filtering */}
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Filter className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Advanced Filtering</h3>
                  <Badge variant="secondary" className="mt-1">Flow 2</Badge>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Comprehensive local filtering for precise vehicle discovery. 
                Perfect for users who want to browse by specific criteria.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Load all vehicles for complete filtering
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time local filtering and sorting
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  No additional API calls for filtering
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Optimized for mobile and slow networks
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Technical Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Technical Optimizations
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Intelligent Caching</h3>
              <p className="text-gray-600 text-sm">
                5-minute cache for vehicle data to reduce API calls and improve performance.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                <Car className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">URL State Management</h3>
              <p className="text-gray-600 text-sm">
                All filters and searches are reflected in URLs for deep linking and sharing.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Handling</h3>
              <p className="text-gray-600 text-sm">
                Graceful fallbacks and error states ensure a smooth user experience.
              </p>
            </Card>
          </div>
        </div>

        {/* Usage Instructions */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">How to Use</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Search className="h-5 w-5 text-blue-600 mr-2" />
                Keyword Search (From Hero)
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-7">
                <li>Type keywords in the search bar above (e.g., "BMW 3 Series", "Tesla", "electric car")</li>
                <li>Optionally add a location for location-based filtering</li>
                <li>Click search to trigger Algolia search → Firebase fetch → Local filtering</li>
                <li>Results are displayed with client-side pagination and sorting</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Filter className="h-5 w-5 text-green-600 mr-2" />
                Advanced Filtering (Direct to Search Page)
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-7">
                <li>Click "Advanced Search" button or navigate to /search directly</li>
                <li>All vehicles are loaded for comprehensive local filtering</li>
                <li>Use sidebar filters for make, model, price, year, fuel type, etc.</li>
                <li>All filtering, sorting, and pagination happens locally for instant results</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> The system automatically chooses the optimal flow based on whether you start with a keyword search or go directly to filtering. Both flows support the same filtering and sorting capabilities once results are loaded.
            </p>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
