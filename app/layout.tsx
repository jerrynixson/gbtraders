import type { Metadata } from 'next'
import './globals.css'
import './styles/scroll.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from "@/components/ui/toaster"
import { headers } from 'next/headers'
import { LoadingIndicator } from "@/components/loading"
import { Inter } from "next/font/google"
import { CookieBanner } from "@/components/cookie-banner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'GB Trader',
  description: 'Best car deals online',
  generator: 'JAB Developers',
}

// Prefetch common routes
const prefetchRoutes = [
  '/signin',
  '/signup',
  '/favourites',
  '/categories/cars',
  '/categories/vans',
  '/categories/motorcycles',
  '/categories/trucks',
  '/categories/electric-vehicles',
  '/categories/caravans',
  '/categories/e-bikes',
  '/categories/garages',
  '/categories/dealers',
  '/categories/breakdown-services',
  '/categories/shop',
  '/news',
  '/for-dealers',
  '/search',
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {prefetchRoutes.map((route) => (
          <link
            key={route}
            rel="prefetch"
            href={route}
            as="document"
          />
        ))}
      </head>
      <body suppressHydrationWarning className={inter.className}>
        <AuthProvider>
          <LoadingIndicator />
          {children}
          <Toaster />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
