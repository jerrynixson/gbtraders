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
      <section className="py-10 bg-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6">Browse by Brand</h2>
        <div className="grid grid-cols-6 gap-6 justify-center">
          {brands.map((brand) => (
            <div key={brand.name} className="flex items-center justify-center bg-white shadow-md rounded-lg p-2">
              <Image src={brand.logo} alt={brand.name} width={80} height={80} />
            </div>
          ))}
        </div>
      </section>
    )
  }