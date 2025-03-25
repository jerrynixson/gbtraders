"use client"

import { useState } from "react"
import { Camera } from "lucide-react"

export function CarImageSection() { 
  // Simulated car images (replace with your actual image paths)
  const carImages = [
    '/cars/car1.jpg',
    '/cars/car1b.jpg',
    '/cars/car1c.jpg',
    '/cars/car1d.jpg',
    '/cars/car1e.jpg',
    '/cars/car1f.jpg'
  ]

  const [mainImageIndex, setMainImageIndex] = useState(0)

  const handleImagePreviewClick = (index) => {
    setMainImageIndex(index)
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div 
        style={{backgroundImage: `url(${carImages[mainImageIndex]})`}}
        className="h-64 md:h-80 rounded-md bg-cover bg-center mb-4"
      />
      
      {/* Image Preview Section */}
      <div className="flex space-x-4 justify-center mb-4">
        {carImages.slice(0, 5).map((image, index) => (
          <button 
            key={index}
            onClick={() => handleImagePreviewClick(index)}
            className={`
              w-24 h-24 rounded-lg bg-cover bg-center 
              transform transition-all duration-300 
              shadow-md hover:shadow-lg
              ${mainImageIndex === index 
                ? 'border-3 border-blue-500 scale-105 ring-4 ring-blue-200' 
                : 'opacity-70 hover:opacity-100'}
            `}
            style={{backgroundImage: `url(${image})`}}
          />
        ))}
      </div>
      
      {/* View Gallery Button */}
      <button className="flex items-center gap-2 bg-black bg-opacity-80 hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transform transition-all duration-300 hover:scale-105 absolute bottom-20 right-4 shadow-lg">
        <Camera className="h-4 w-4" />
        <span className="font-medium">View Gallery</span>
      </button>
    </div>
  )
}