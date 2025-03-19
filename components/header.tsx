import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, User } from "lucide-react"

export function Header() {
  return (
    <>
    {/* Top navigation bar */}
    <div className="bg-gray-100 py-2">
      <div className="container mx-auto flex justify-center space-x-6">
        <Link href="/cars" className="text-sm font-medium hover:text-blue-600">Cars</Link>
        <Link href="/vans" className="text-sm font-medium hover:text-blue-600">Vans</Link>
        <Link href="/garages" className="text-sm font-medium hover:text-blue-600">Garages</Link>
        <Link href="/car-parts" className="text-sm font-medium hover:text-blue-600">Car Parts</Link>
        <Link href="/dealers" className="text-sm font-medium hover:text-blue-600">Dealers</Link>
        <Link href="/breakdown-services" className="text-sm font-medium hover:text-blue-600">Breakdown Services</Link>
      </div>
    </div>

    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
          
          <Image
          src="/GBtrader Logo.png"
          alt="GB Trader Logo"
          width={120}
          height={80}
          style={{ height: 'auto', width: '120px' }}
          priority
          />
            
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="text-sm font-medium">Used Cars</Link>
            <Link href="#" className="text-sm font-medium">New Cars</Link>

            
            <Link href="#" className="text-sm font-medium">Car Rentals</Link>
            <Link href="#" className="text-sm font-medium">Search</Link>
            <Link href="/dealers" className="text-sm font-medium">For Dealers</Link>
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
    </>
  )
}