"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CarImageSectionProps {
  images: string[];
}

export function CarImageSection({ images }: CarImageSectionProps) { 
  const [mainImageIndex, setMainImageIndex] = useState(0)

  const handleImagePreviewClick = (index: number) => {
    setMainImageIndex(index)
  }

  const handlePrevImage = () => {
    setMainImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setMainImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm group">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No images available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm group">
      {/* Main Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={images[mainImageIndex]}
          alt="Car view"
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          priority
        />

        {/* Navigation Controls */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Navigation Container */}
          <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <button 
              onClick={handlePrevImage}
              className="inline-flex items-center justify-center rounded-full p-1 text-white/80 transition-colors hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleImagePreviewClick(index)}
                  className={cn(
                    "w-1 h-1 rounded-full transition-all duration-200",
                    mainImageIndex === index 
                      ? "bg-white w-3" 
                      : "bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={handleNextImage}
              className="inline-flex items-center justify-center rounded-full p-1 text-white/80 transition-colors hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Thumbnails Section */}
      <div className="flex gap-2 p-4 bg-background">
        {images.map((image, index) => (
          <button 
            key={index}
            onClick={() => handleImagePreviewClick(index)}
            className={cn(
              "relative h-16 w-24 overflow-hidden rounded-md transition-all duration-200",
              mainImageIndex === index 
                ? "ring-2 ring-primary opacity-100" 
                : "opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`Car view ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}