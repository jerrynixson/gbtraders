"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

const AUTO_SCROLL_INTERVAL = 5000;
const RESUME_SCROLL_DELAY = 10000;
const DRAG_THRESHOLD = 50;

interface CarouselProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  title: string;
  viewMoreLink?: string;
  autoScroll?: boolean;
  className?: string;
}

export function Carousel({
  items,
  renderItem,
  title,
  viewMoreLink,
  autoScroll = true,
  className = "",
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextItem = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevItem = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleUserInteraction = useCallback(() => {
    setIsAutoScrolling(false);
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setIsAnimating(false);
    handleUserInteraction();
  }, [handleUserInteraction]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    const x = clientX - startX;
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const dragPercentage = (x / containerWidth) * 100;
    const newScrollLeft = -currentIndex * 100 + dragPercentage;
    
    if (newScrollLeft > 0 || newScrollLeft < -(items.length - 1) * 100) return;
    
    setScrollLeft(newScrollLeft);
  }, [isDragging, startX, currentIndex, items.length]);

  const handleDragEnd = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const x = clientX - startX;
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const dragPercentage = (x / containerWidth) * 100;

    if (Math.abs(dragPercentage) > DRAG_THRESHOLD) {
      const direction = dragPercentage > 0 ? -1 : 1;
      const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + direction));
      setCurrentIndex(newIndex);
    }

    setScrollLeft(-currentIndex * 100);
    setIsAnimating(true);
  }, [isDragging, startX, currentIndex, items.length]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    handleDragEnd(e.changedTouches[0].clientX);
  }, [handleDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    handleDragEnd(e.clientX);
  }, [handleDragEnd]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleDragEnd(e.clientX);
    }
  }, [isDragging, handleDragEnd]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(nextItem, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isAutoScrolling, nextItem]);

  // Resume auto-scroll after delay
  useEffect(() => {
    if (!isAutoScrolling) {
      const timeout = setTimeout(() => {
        setIsAutoScrolling(true);
      }, RESUME_SCROLL_DELAY);

      return () => clearTimeout(timeout);
    }
  }, [isAutoScrolling]);

  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>

        <div className="relative">
          {/* Mobile Carousel */}
          <div className="relative sm:hidden">
            <div 
              ref={containerRef}
              className="overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ 
                  transform: `translateX(${isDragging ? scrollLeft : -currentIndex * 100}%)`,
                  transition: isAnimating ? 'transform 0.3s ease-out' : 'none'
                }}
              >
                {items.map((item, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    {renderItem(item)}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {items.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    handleUserInteraction();
                    setCurrentIndex(index);
                  }}
                  aria-label={`Go to item ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div key={index}>
                {renderItem(item)}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 hidden sm:flex"
            onClick={() => {
              handleUserInteraction();
              prevItem();
            }}
            aria-label="Previous item"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 hidden sm:flex"
            onClick={() => {
              handleUserInteraction();
              nextItem();
            }}
            aria-label="Next item"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {viewMoreLink && (
          <div className="flex justify-center mt-8">
            <a 
              href={viewMoreLink}
              className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
              aria-label="View more items"
            >
              View more deals <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
