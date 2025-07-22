'use client'

import Image from "next/image"
import Link from "next/link"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Grid } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/grid'

const brands = [
  { name: "Audi", logo: "/brands/audi.png" },
  { name: "BMW", logo: "/brands/bmw.png" },
  { name: "Mercedes", logo: "/brands/mercedes.png" },
  { name: "Toyota", logo: "/brands/toyota.png" },
  { name: "Honda", logo: "/brands/honda.png" },
  { name: "Ford", logo: "/brands/ford.png" },
  { name: "Nissan", logo: "/brands/nissan.png" },
  { name: "Chevrolet", logo: "/brands/chevrolet.png" },
  { name: "Volkswagen", logo: "/brands/volkswagen.png" },
  { name: "Hyundai", logo: "/brands/hyundai.png" },
  { name: "Renault", logo: "/brands/renault.png" },
  { name: "Kia", logo: "/brands/kia.png" },
]

export function BrowseByBrand() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="w-full max-w-[85rem] mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Browse by Brand</h2>
          <p className="mt-2 text-sm text-gray-600">Find your perfect vehicle from our collection</p>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:grid grid-cols-4 gap-4">
          {brands.map((brand) => (
            <Link 
              key={brand.name}
              href={`/search?make=${encodeURIComponent(brand.name)}&type=car`}
              className="relative group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 cursor-pointer"
            >
              <div className="flex items-center justify-center h-20">
                <Image 
                  src={brand.logo} 
                  alt={brand.name} 
                  width={85} 
                  height={85}
                  className="object-contain transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View with Swiper 2x2 Grid */}
        <div className="md:hidden">
          <Swiper
            modules={[Grid]}
            spaceBetween={16}
            slidesPerView={2}
            grid={{ rows: 2, fill: 'row' }}
            className="brand-swiper"
          >
            {brands.map((brand) => (
              <SwiperSlide key={brand.name}>
                <Link
                  href={`/search?make=${encodeURIComponent(brand.name)}&type=car`}
                  className="relative group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 h-[120px] flex items-center justify-center cursor-pointer"
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={85}
                    height={85}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}