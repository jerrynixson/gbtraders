"use client";

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// Define types for all data structures
interface ProductType {
  id: number;
  name: string;
  compatibility: string;
  price: string;
  image: string;
}

interface CategoryType {
  name: string;
  image: string;
}

interface BrandType {
  name: string;
  logo: string;
}

// Define the component props interface
interface ShopPageProps {
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeFeatures?: boolean;
  customCategories?: CategoryType[];
  customPopularProducts?: ProductType[];
  customNewArrivals?: ProductType[];
  customBrands?: BrandType[];
}

// Reusable Product component
const Product = ({ product }: { product: ProductType }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="relative overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-48 object-contain bg-gray-50 p-4 group-hover:scale-110 transition-transform duration-500" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors duration-200">
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#312e81] transition-colors duration-300">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{product.compatibility}</p>
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-[#312e81]">{product.price}</div>
        <button className="px-6 py-2 bg-[#312e81] text-white font-medium rounded-lg hover:bg-[#312e81]/90 transition-colors duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);

// Features Bar component
const FeaturesBar = () => (
  <div className="bg-gradient-to-r from-[#312e81] via-[#312e81] to-[#312e81] text-white">
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-around flex-wrap gap-6">
        <div className="flex items-center gap-3 group">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium group-hover:text-white/90 transition-colors duration-300">Free UK-Wide delivery</span>
        </div>
        <div className="flex items-center gap-3 group">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium group-hover:text-white/90 transition-colors duration-300">14-day no-quibble</span>
        </div>
        <div className="flex items-center gap-3 group">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-sm font-medium group-hover:text-white/90 transition-colors duration-300">Fair pricing you can trust</span>
        </div>
        <div className="flex items-center gap-3 group">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium group-hover:text-white/90 transition-colors duration-300">All cars AA inspected</span>
        </div>
      </div>
    </div>
  </div>
);

// Main Shop component
export default function ShopPage({
  includeHeader = true,
  includeFooter = true,
  includeFeatures = true,
  customCategories,
  customPopularProducts,
  customNewArrivals,
  customBrands
}: ShopPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 400; // Adjust this value to control scroll distance
      const newScrollLeft = direction === 'left' 
        ? categoriesRef.current.scrollLeft - scrollAmount
        : categoriesRef.current.scrollLeft + scrollAmount;
      
      categoriesRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

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

  // Default data, can be overridden via props
  const categories: CategoryType[] = customCategories || [
    { name: 'Engine Parts', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44z"/><path d="M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>' },
    { name: 'Brakes', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>' },
    { name: 'Suspension', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>' },
    { name: 'Filters', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>' },
    { name: 'Electrical', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>' },
    { name: 'Body Parts', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>' },
    { name: 'Accessories', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-3.5V9h4v7.5l3.5-3.5-1.5-1.5L12 15l-3.5-3.5-1.5 1.5L10 16.5z"/></svg>' },
    { name: 'Tools', image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>' }
  ];

  const popularProducts: ProductType[] = customPopularProducts || [
    {
      id: 1,
      name: 'Premium Oil Filter',
      compatibility: 'Engine Parts - Fits: Ford, Vauxhall, Nissan',
      price: '£12.99',
      image: 'https://images-na.ssl-images-amazon.com/images/I/51jXPwjeVcL.AC_US1000.jpg'
    },
    {
      id: 2,
      name: 'Performance Brake Pads',
      compatibility: 'Brakes - Fits: Audi, BMW, Mercedes',
      price: '£39.99',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      name: 'High-Flow Air Filter',
      compatibility: 'Filters - Universal Fit',
      price: '£15.49',
      image: 'https://cdn.shopify.com/s/files/1/0240/7077/products/img_2318_2@2x.jpg?v=1571438667'
    },
    {
      id: 4,
      name: 'Iridium Spark Plugs (Set of 4)',
      compatibility: 'Electrical - Fits: Multiple Models',
      price: '£24.99',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&auto=format&fit=crop&q=60'
    }
  ];

  const newArrivals: ProductType[] = customNewArrivals || [
    {
      id: 5,
      name: 'LED Headlight Conversion Kit',
      compatibility: 'Electrical - Universal Fit',
      price: '£89.99',
      image: 'https://www.carid.com/images/lumen/items/h11xhlc-rgb-7.jpg'
    },
    {
      id: 6,
      name: 'Premium Car Battery',
      compatibility: 'Electrical - Fits: Multiple Models',
      price: '£79.99',
      image: 'https://carbatteryworld.com/wp-content/uploads/2021/01/5372052.jpg'
    },
    {
      id: 7,
      name: '1080p Dash Camera',
      compatibility: 'Accessories - Universal Fit',
      price: '£49.99',
      image: 'https://images-na.ssl-images-amazon.com/images/I/61BuslHLOIL.AC_SL1000.jpg'
    },
    {
      id: 8,
      name: 'All-Weather Floor Mats',
      compatibility: 'Accessories - Available for most models',
      price: '£29.99',
      image: 'https://assets.shopbmwusa.com/assets/images/highquality/51472219794-01_4905.jpg'
    }
  ];

  const brands: BrandType[] = customBrands || [
    { name: 'Bosch', logo: '' },
    { name: 'NGK', logo: '' },
    { name: 'Denso', logo: '' },
    { name: 'Brembo', logo: '' },
    { name: 'Mann', logo: '' },
    { name: 'Valeo', logo: '' },
    { name: 'Febi', logo: '' },
    { name: 'Castrol', logo: '' }
  ];

  // Sort products based on selected option
  const sortProducts = (products: ProductType[]) => {
    switch (sortOption) {
      case 'price-low-high':
        return [...products].sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
      case 'price-high-low':
        return [...products].sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          return priceB - priceA;
        });
      case 'name-asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return products;
    }
  };

  // Filter products based on search and filters
  const filterProducts = (products: ProductType[]) => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.compatibility.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPrice = (!priceRange.min || parseFloat(product.price.replace(/[^0-9.]/g, '')) >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || parseFloat(product.price.replace(/[^0-9.]/g, '')) <= parseFloat(priceRange.max));
      
      const matchesCategory = selectedCategories.length === 0 || 
                            selectedCategories.some(category => {
                              const productCategory = product.compatibility.toLowerCase();
                              return productCategory.includes(category.toLowerCase());
                            });
      
      const matchesBrand = selectedBrands.length === 0 || 
                          selectedBrands.some(brand => product.name.toLowerCase().includes(brand.toLowerCase()));
      
      return matchesSearch && matchesPrice && matchesCategory && matchesBrand;
    });
  };

  const sortedAndFilteredPopularProducts = sortProducts(filterProducts(popularProducts));
  const sortedAndFilteredNewArrivals = sortProducts(filterProducts(newArrivals));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {includeHeader && <Header />}
      {includeFeatures && <FeaturesBar />}

      {/* Shop Header */}
      <div className="bg-gradient-to-r from-[#312e81] via-[#312e81] to-[#312e81] text-white py-12 mb-12 relative overflow-visible">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-6 text-center">Car Parts & Accessories Shop</h1>
          
          {/* Enhanced Search */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Search for parts, accessories, tools..." 
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
                <div className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                  activeDropdown === 'sort' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
                }`}>
                  <div className="p-4">
                    <div className="flex flex-col gap-2">
                      {[
                        { value: 'relevance', label: 'Relevance' },
                        { value: 'price-low-high', label: 'Price: Low to High' },
                        { value: 'price-high-low', label: 'Price: High to Low' },
                        { value: 'name-asc', label: 'Name: A to Z' },
                        { value: 'name-desc', label: 'Name: Z to A' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          className={`px-4 py-2 text-left text-sm rounded-md transition-colors duration-200 ${
                            sortOption === option.value
                              ? 'bg-[#312e81]/10 text-[#312e81] font-medium'
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
              <div className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                activeDropdown === 'price' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
              }`}>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    />
                    <span className="text-gray-500">to</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    />
                  </div>
                  <button 
                    className="w-full py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-300"
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
                Categories
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                activeDropdown === 'categories' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
              }`}>
                <div className="p-6">
                  <div className="max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {categories.map((category, index) => (
                        <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                      className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-300"
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
              <div className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl transform transition-all duration-300 origin-top-left ${
                activeDropdown === 'brands' ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
              }`}>
                <div className="p-6">
                  <div className="max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {brands.map((brand, index) => (
                        <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                      className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-300"
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

      <div className="container mx-auto px-4 pb-16">
        {/* Categories with Navigation Arrows */}
        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2 -ml-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div 
            ref={categoriesRef}
            className="flex gap-6 mb-10 overflow-x-auto scrollbar-hide px-4 scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((category, index) => (
              <div 
                key={index} 
                className={`flex-shrink-0 min-w-[180px] bg-white rounded-xl p-6 flex flex-col items-center transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md cursor-pointer ${
                  selectedCategories.includes(category.name) 
                    ? 'ring-2 ring-[#312e81] scale-105 bg-[#312e81]/10 shadow-lg' 
                    : 'hover:ring-1 hover:ring-[#312e81]/20'
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
                    ? 'bg-[#312e81]/10 scale-110' 
                    : 'bg-gray-100'
                }`}>
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className={`w-8 h-8 transition-transform duration-300 ${
                      selectedCategories.includes(category.name) ? 'scale-110' : ''
                    }`}
                  />
                </div>
                <div className={`text-sm font-medium transition-colors duration-300 ${
                  selectedCategories.includes(category.name) 
                    ? 'text-[#312e81] font-semibold' 
                    : 'text-gray-800'
                }`}>
                  {category.name}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md rounded-full p-2 -mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Popular Products */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <div className="p-2 bg-[#312e81]/10 rounded-lg">
              <svg className="w-8 h-8 text-[#312e81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            Popular Parts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedAndFilteredPopularProducts.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Promotion */}
        <div className="bg-gradient-to-r from-[#312e81] via-[#312e81] to-[#312e81] text-white rounded-2xl p-10 mb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Spring Service Special</h2>
              <p className="text-lg opacity-90 max-w-xl">Get 15% off on all service parts packages. Perfect time to prepare your car for summer driving!</p>
            </div>
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center gap-2">
              <span>Shop Now</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* New Arrivals */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <div className="p-2 bg-[#312e81]/10 rounded-lg">
              <svg className="w-8 h-8 text-[#312e81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            New Arrivals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedAndFilteredNewArrivals.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <div className="p-2 bg-[#312e81]/10 rounded-lg">
              <svg className="w-8 h-8 text-[#312e81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            Shop by Brand
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6">
            {brands.map((brand, index) => (
              <div key={index} className="bg-white rounded-xl p-6 flex items-center justify-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
                <div className="w-full h-12 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-800 group-hover:text-[#312e81] transition-colors duration-300">{brand.name}</span>
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
export { Footer, FeaturesBar, Product };