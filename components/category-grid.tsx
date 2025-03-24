import Image from "next/image"
import Link from "next/link"

interface CategoryGridProps {
  categories: {
    title: string
    href: string
    image?: string
  }[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="container mx-auto px-4 mb-12">
      <div className="w-full md:w-full lg:max-w-[95%] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="relative group overflow-hidden rounded-lg aspect-[4/3]"
            >
              {category.image ? (
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-secondary transition-transform duration-300 group-hover:scale-110" />
              )}
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h3 className="absolute bottom-4 left-4 text-white text-xl font-semibold">{category.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

