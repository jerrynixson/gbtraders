"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FilterSidebar } from "@/components/search/filter-sidebar"
import { SearchHeader } from "@/components/search/search-header"
import { CarListings } from "@/components/car-listings"

export default function SearchPage() {
  const [sortBy, setSortBy] = useState("distance")

  // Mock data - in a real app, this would come from an API call
  const resultsCount = 18272
  const category = "Used cars"

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-80 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
              <FilterSidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 md:pl-8 pt-8 md:pt-0">
              <SearchHeader category={category} resultsCount={resultsCount} onSortChange={setSortBy} />

              <CarListings />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

