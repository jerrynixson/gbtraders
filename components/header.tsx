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
              src="/placeholder.svg?height=50&width=130"
              alt="GB Trader Logo"
              width={130}
              height={50}
              className="h-12 w-auto"
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="text-sm font-medium">
              Used Cars
            </Link>
            <Link href="#" className="text-sm font-medium">
              New Cars
            </Link>
            <Link href="#" className="text-sm font-medium">
              Car Reviews
            </Link>
            <Link href="#" className="text-sm font-medium">
              Car Rentals
            </Link>
            <Link href="#" className="text-sm font-medium">
              Buy a Car
            </Link>
            <Link href="#" className="text-sm font-medium">
              Search Vehicle
            </Link>
          </nav>
        </div>
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

