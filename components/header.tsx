import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, User } from "lucide-react";

export function Header() {
  return (
    <>
      {/* Top section with logo and centered navigation */}
      <div className="relative bg-gray-100 py-2">
        <div className="container mx-auto flex justify-between items-center px-4">
          {/* Logo at Top Left */}
          <Link href="/" className="flex items-center">
            <Image
              src="/GBtrader Logo.png"
              alt="GB Trader Logo"
              width={120}  // Original size maintained
              height={80}
              style={{ height: "auto", maxWidth: "120px" }}
              priority
            />
          </Link>

          {/* Navigation Menu in an "Island" */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-full px-6 py-2 flex space-x-6">
            <Link href="/cars" className="text-sm font-medium hover:text-blue-600">
              Cars
            </Link>
            <Link href="/vans" className="text-sm font-medium hover:text-blue-600">
              Vans
            </Link>
            <Link href="/garages" className="text-sm font-medium hover:text-blue-600">
              Garages
            </Link>
            <Link href="/car-parts" className="text-sm font-medium hover:text-blue-600">
              Car Parts
            </Link>
            <Link href="/dealers" className="text-sm font-medium hover:text-blue-600">
              Dealers
            </Link>
            <Link href="/breakdown-services" className="text-sm font-medium hover:text-blue-600">
              Breakdown Services
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Section */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="text-sm font-medium">
              Used Cars
            </Link>
            <Link href="#" className="text-sm font-medium">
              New Cars
            </Link>
            <Link href="#" className="text-sm font-medium">
              Car Rentals
            </Link>
            <Link href="#" className="text-sm font-medium">
              Search
            </Link>
            <Link href="/dealers" className="text-sm font-medium">
              For Dealers
            </Link>
            <Link href="/news" className="text-sm font-medium text-secondary hover:text-primary">
              Car Reviews & News
            </Link>
            <Link href="/search" className="text-sm font-medium">
              Search
            </Link>
          </nav>

          {/* User Actions */}
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
  );
}
