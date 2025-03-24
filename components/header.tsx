"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, User, Menu, X, Newspaper, Search, Store } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const topNavItems = [
    { href: "/cars", label: "Cars" },
    { href: "/vans", label: "Vans" },
    { href: "/garages", label: "Garages" },
    { href: "/car-parts", label: "Car Parts" },
    { href: "/breakdown-services", label: "Breakdown Services" },
  ]

  const bottomNavItems = [
    { href: "/news", label: "News & Blogs", icon: <Newspaper className="h-4 w-4" /> },
    { href: "/dealers", label: "For Dealers", icon: <Store className="h-4 w-4" /> },
    { href: "/search", label: "Search", icon: <Search className="h-4 w-4" /> },
  ]

  return (
    <header className="border-b border-gray-200 py-3 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo - Using auto-scaling approach */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="relative w-auto h-auto max-h-16">
              <Image
                src="/gbtrader-logo.png"
                alt="GB Trader Logo"
                width={1080}
                height={1080}
                className="w-auto max-h-16 object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-col items-center flex-grow mx-8">
            <div className="bg-gray-100 rounded-full px-6 py-2 mb-3 inline-flex">
              <nav className="flex items-center space-x-8">
                {topNavItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm font-medium hover:text-primary">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <nav className="flex items-center space-x-8">
              {bottomNavItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm font-medium flex items-center space-x-2 hover:text-primary">
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden lg:flex">
              <Heart className="h-6 w-6" />
            </Button>
            <Link href="/sign-in" className="hidden lg:block">
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-white border-t pt-4">
            <div className="flex">
              <div className="flex-grow pr-4">
                <div className="mb-6">
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3">Main Navigation</h3>
                  <div className="flex flex-wrap gap-2">
                    {topNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="inline-flex bg-gray-100 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3">Categories</h3>
                  <nav className="flex flex-col space-y-3">
                    {bottomNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm font-medium py-2 border-b border-gray-100 flex items-center space-x-2 hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="w-24 border-l pl-4 flex flex-col space-y-4">
                <Link href="/favorites" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Favorites</span>
                  </Button>
                </Link>
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                    <span className="sr-only">Sign In</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
