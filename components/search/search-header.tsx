"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookmarkPlus } from "lucide-react"

type SearchHeaderProps = {
  category: string
  resultsCount: number
  onSortChange: (value: string) => void
}

export function SearchHeader({ category, resultsCount, onSortChange }: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {" > "}
        <Link href={`/${category.toLowerCase().replace(" ", "-")}`} className="hover:underline">
          {category}
        </Link>
        {" > "}
        <span>car search results</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-4">{resultsCount.toLocaleString()} results</h1>
          <Button variant="outline" size="sm" className="flex items-center">
            <BookmarkPlus className="h-4 w-4 mr-2" />
            Save Search
          </Button>
        </div>

        <div className="flex items-center">
          <select className="border border-gray-300 rounded-md p-2" onChange={(e) => onSortChange(e.target.value)}>
            <option value="distance">Sort by distance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest Listed</option>
            <option value="mileage">Mileage</option>
          </select>
        </div>
      </div>
    </div>
  )
}

