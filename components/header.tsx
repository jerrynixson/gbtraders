import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, User } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/GB_Banner.png"
              alt="GB Trader Logo"
              width={130}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="text-sm font-medium">Used Cars</Link>
            <Link href="#" className="text-sm font-medium">New Cars</Link>

            
            <Link href="#" className="text-sm font-medium">Car Rentals</Link>
            <Link href="#" className="text-sm font-medium">Search</Link>
            <details className="relative group">
            <summary className="cursor-pointer flex items-center text-sm font-medium">
              Car
              <span className="ml-1">▼</span> {/* Dropdown Arrow */}
            </summary>
            <ul className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-lg py-2 hidden group-open:block">
              <li><Link href="/cars" className="block px-4 py-2 text-sm hover:bg-gray-100">Car</Link></li>
              <li><Link href="/vans" className="block px-4 py-2 text-sm hover:bg-gray-100">Vans</Link></li>
              <li><Link href="/garages" className="block px-4 py-2 text-sm hover:bg-gray-100">Garages</Link></li>
              <li><Link href="/car-parts" className="block px-4 py-2 text-sm hover:bg-gray-100">Car Parts</Link></li>
              <li><Link href="/dealers" className="block px-4 py-2 text-sm hover:bg-gray-100">Dealers</Link></li>
              <li><Link href="/breakdown-services" className="block px-4 py-2 text-sm hover:bg-gray-100">Breakdown Services</Link></li>
            </ul>
          </details>
          </nav>
        </div>

        {/* User Actions: Dropdown before Heart Icon */}
        <div className="flex items-center space-x-4">
          

          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}