"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Heart, ChevronRight } from "lucide-react"

// Reuse the VehicleCard component from search page
type Vehicle = {
  id: number
  title: string
  price: number
  monthlyPrice: number
  mainImage: string
  distance: string
  location: string
  year: number
  mileage: number
  fuel: string
  transmission: string
  bodyType: string
  engine: string
  color: string
  dealerRating: number
  dealerReviews: number
  features: string[]
  isSponsored: boolean
  isHighlighted: boolean
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [isFavorite, setIsFavorite] = useState(true)

  const handleRemoveFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const updatedFavorites = favorites.filter((fav: Vehicle) => fav.id !== vehicle.id)
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    setIsFavorite(false)
    // Force a re-render of the parent component
    window.dispatchEvent(new Event('favoritesUpdated'))
  }

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-100 flex flex-col h-full">
      <div className="relative w-full">
        <div className="relative overflow-hidden">
          <img 
            src={vehicle.mainImage} 
            alt={vehicle.title}
            className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-white text-sm font-medium">View Details</div>
          </div>
        </div>
        <button 
          onClick={handleRemoveFavorite}
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all duration-200 hover:scale-110 z-10"
        >
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-blue-800 transition-colors duration-200 line-clamp-2">{vehicle.title}</h3>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-xs text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    {vehicle.distance}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{vehicle.location}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Year:</span> 
              <span className="text-gray-600">{vehicle.year}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Mileage:</span> 
              <span className="text-gray-600">{vehicle.mileage.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Fuel:</span> 
              <span className="text-gray-600">{vehicle.fuel}</span>
            </div>
            <div className="flex items-center text-xs bg-gray-50 p-1.5 rounded-lg">
              <span className="font-medium text-gray-700 mr-1">Trans:</span> 
              <span className="text-gray-600">{vehicle.transmission}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto">
          <div>
            <div className="text-xl font-bold text-blue-800">£{vehicle.price.toLocaleString()}</div>
            <div className="text-xs text-gray-600">£{vehicle.monthlyPrice}/month</div>
          </div>
          
          <Button 
            className="w-full mt-6 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 h-10 shadow-md rounded-lg font-semibold"
          >
            <span>View Details</span>
            <ChevronRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function FavouritesPage() {
  const [favorites, setFavorites] = useState<Vehicle[]>([])

  useEffect(() => {
    const loadFavorites = () => {
      const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      setFavorites(storedFavorites)
    }

    loadFavorites()
    window.addEventListener('favoritesUpdated', loadFavorites)

    return () => {
      window.removeEventListener('favoritesUpdated', loadFavorites)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto py-8 px-2 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="mt-2 text-gray-600">Your saved vehicle listings</p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">Start adding vehicles to your favorites by clicking the heart icon on any listing.</p>
              <Button 
                className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700"
                onClick={() => window.location.href = '/search'}
              >
                Browse Vehicles
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
} 