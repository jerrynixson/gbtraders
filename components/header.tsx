"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  User, 
  Menu, 
  X, 
  Newspaper, 
  Search, 
  Store, 
  ChevronDown,
  LogOut,
  Megaphone,
  Settings,
  PlusCircle,
  UserCircle,
  LayoutDashboard
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAdmin } from "@/hooks/useAdmin"

interface NavItem {
  href?: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownNavItem {
  type: "dropdown";
  label: string;
  items: NavItem[];
}

type TopNavItem = NavItem | DropdownNavItem;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { isAdmin } = useAdmin()
  const { toast } = useToast()

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(email => email.trim());

  const handleSignOut = async () => {
    try {
      await logout()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        variant: "default",
      })
      router.push('/')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
    setShowSignOutDialog(false)
  }

  const vehicleNavItems: NavItem[] = [
    { href: "/categories/cars", label: "Cars" },
    { href: "/categories/vans", label: "Vans" },
    // { href: "/categories/motorcycles", label: "Motorcycles" },
    { href: "/categories/trucks", label: "Trucks" },
    // { href: "/categories/electric-vehicles", label: "Electric Vehicles" },
    // { href: "/categories/caravans", label: "Caravans" },
    // { href: "/categories/e-bikes", label: "E-Bikes" }
  ]

  const dealerNavItems: NavItem[] = [
    { href: "/dashboard/add-listing", label: "Post Listing", icon: <PlusCircle className="h-4 w-4" /> }
  ]

  const adminNavItems: NavItem[] = [
    { href: "/admin", label: "Admin Panel", icon: <Settings className="h-4 w-4" /> },
  ]

  const userNavItems: NavItem[] = [
    { href: "/profile", label: "Profile", icon: <UserCircle className="h-4 w-4" /> }
  ]

  const topNavItems: TopNavItem[] = [
    { 
      type: "dropdown", 
      label: "Vehicles", 
      items: vehicleNavItems 
    },
    // { href: "/categories/garages", label: "Garages" },
    { href: "/categories/dealers", label: "Dealers" },
    // { href: "/categories/breakdown-services", label: "Breakdown Services" },
    // { href: "/categories/shop", label: "Shop" },
  ]

  const bottomNavItems: NavItem[] = [
    // { href: "/news", label: "News & Blogs", icon: <Newspaper className="h-4 w-4" /> },
    // { href: "/for-dealers", label: "For Dealers", icon: <Store className="h-4 w-4" /> },
    // { href: "/search", label: "Search", icon: <Search className="h-4 w-4" /> },
  ]

  // Type guard to check if an item is a dropdown
  const isDropdownItem = (item: TopNavItem): item is DropdownNavItem => 
    (item as DropdownNavItem).type === "dropdown";

  return (
    <header className="border-b border-gray-200 py-1 lg:py-3 bg-white">
      <div className="container mx-auto px-4 my-0 lg:my-0">
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
                loading="eager"
                quality={75}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-col items-center flex-grow mx-8">
            <div className="bg-gray-100 rounded-full px-6 py-2 mb-3 inline-flex">
              <nav className="flex items-center space-x-8">
                {topNavItems.map((item, index) => 
                  isDropdownItem(item) ? (
                    <DropdownMenu key={index}>
                      <DropdownMenuTrigger className="text-sm font-medium flex items-center hover:text-primary">
                        {item.label}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {item.items.map((subItem) => (
                          <DropdownMenuItem key={subItem.href} asChild>
                            {subItem.href ? (
                              <Link href={subItem.href} className="cursor-pointer">
                                {subItem.label}
                              </Link>
                            ) : (
                              <span>{subItem.label}</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    item.href && (
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        className="text-sm font-medium hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    )
                  )
                )}
                {/* Simple 'Search' text link with small icon after Dealers link */}
                <Link href="/search" className="text-sm font-medium hover:text-primary ml-2 flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Search
                </Link>
              </nav>
            </div>
            <nav className="flex items-center space-x-8">
              {bottomNavItems.map((item) => (
                item.href && (
                  // <Link 
                  //   key={item.href} 
                  //   href={item.href} 
                  //   className="text-sm font-medium flex items-center space-x-2 hover:text-primary"
                  // >
                  //   {item.icon}
                  //   <span>{item.label}</span>
                  // </Link>
                  item.href === "/search" && (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className="text-sm font-medium flex items-center space-x-2 hover:text-primary"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )
                )
              ))}
            </nav>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {/* Desktop-only Favourites */}
            <Link href="/favourites">
              <Button variant="ghost" size="icon" className="hidden lg:flex">
                <Heart className="h-6 w-6" />
              </Button>
            </Link>
            {user && user.role === "dealer" && (
              <Link href="/dashboard">
                <Button variant="secondary" className="hidden lg:flex">
                  Dashboard
                </Button>
              </Link>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden lg:flex">
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user && (
                    <>
                      {userNavItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href || '#'} className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user && (user.role === "dealer" || isAdmin) && (
                    <>
                      {dealerNavItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href || '#'} className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {isAdmin && (
                    <>
                      {adminNavItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href || '#'} className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem className="flex items-center gap-2" onClick={() => setShowSignOutDialog(true)}>
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={`/signin?redirectTo=${encodeURIComponent(pathname)}`} className="hidden lg:block">
                <Button variant="ghost" size="icon">
                  <User className="h-6 w-6" />
                </Button>
              </Link>
            )}
            {/* Mobile-only buttons: Favourites, Profile, then Hamburger as rightmost */}
            <Link href="/favourites" className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Heart className="h-6 w-6" />
              </Button>
            </Link>
            {user && (
              <Link href="/profile" className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </Link>
            )}
            {/* Hamburger menu icon (mobile only, rightmost) */}
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
                    {topNavItems.map((item, index) => 
                      isDropdownItem(item) ? (
                        <div key={index} className="inline-block">
                          <div className="bg-gray-100 rounded-full px-4 py-2 text-sm font-medium">
                            {item.label}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.items.map((subItem) => (
                              subItem.href && (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className="inline-flex bg-gray-50 rounded-full px-3 py-1 text-xs font-medium hover:bg-gray-200"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              )
                            ))}
                          </div>
                        </div>
                      ) : (
                        item.href && (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="inline-flex bg-gray-100 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        )
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-3">Categories</h3>
                  <nav className="flex flex-col space-y-3">
                    {bottomNavItems.map((item) => (
                      item.href && (
                        // <Link
                        //   key={item.href}
                        //   href={item.href}
                        //   className="text-sm font-medium py-2 border-b border-gray-100 flex items-center space-x-2 hover:text-primary"
                        //   onClick={() => setMobileMenuOpen(false)}
                        // >
                        //   {item.icon}
                        //   <span>{item.label}</span>
                        // </Link>
                        item.href === "/search" && (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium py-2 border-b border-gray-100 flex items-center space-x-2 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        )
                      )
                    ))}
                  </nav>
                </div>
              </div>
              <div className="w-24 border-l pl-4 flex flex-col space-y-4">
                <Link href="/favourites" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Favorites</span>
                  </Button>
                </Link>
                {/* Add Search button for mobile */}
                <Link href="/search" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </Link>
                {user && user.role === "dealer" && (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="sr-only">Dashboard</span>
                    </Button>
                  </Link>
                )}
                {user ? (
                  <>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                        <UserCircle className="h-4 w-4" />
                        <span className="sr-only">Profile</span>
                      </Button>
                    </Link>
                    {user.role === "dealer" && (
                      <Link href="/dashboard/add-listing" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                          <PlusCircle className="h-4 w-4" />
                          <span className="sr-only">Add Listing</span>
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full flex items-center justify-center"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setShowSignOutDialog(true)
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="sr-only">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <Link href={`/signin?redirectTo=${encodeURIComponent(pathname)}`} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                      <span className="sr-only">Sign In</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}