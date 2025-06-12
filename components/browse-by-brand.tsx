import Image from "next/image"

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <div 
                key={brand.name} 
                className="relative group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4"
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
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }