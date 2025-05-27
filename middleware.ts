import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the session cookie
  const sessionCookie = request.cookies.get('session')?.value

  // Check if the request is for the dealer dashboard
  if (request.nextUrl.pathname.startsWith('/dealer/dashboard')) {
    if (!sessionCookie) {
      // Redirect to sign in if no session cookie
      return NextResponse.redirect(new URL('/signin?redirectTo=/dealer/dashboard', request.url))
    }

    try {
      // Check role using the API route
      const response = await fetch(`${request.nextUrl.origin}/api/auth/check-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionCookie }),
      })

      const data = await response.json()

      if (!response.ok || data.role !== 'dealer') {
        // Not a dealer or error occurred, redirect to home
        return NextResponse.redirect(new URL('/', request.url))
      }

      // User is authenticated and is a dealer, allow access
      return NextResponse.next()
    } catch (error) {
      // Error occurred, redirect to sign in
      return NextResponse.redirect(new URL('/signin?redirectTo=/dealer/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: '/dealer/dashboard/:path*'
} 