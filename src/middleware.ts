import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from 'next/server'

const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)"
])

const isApiRoute = (pathname: string) => pathname.startsWith('/api/')

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware(async (auth, req) => {
  // Allow access to public routes
  if (publicRoutes(req)) {
    return NextResponse.next()
  }

  // Handle unauthenticated users
  const { userId } = await auth()
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Skip family check for API routes
  if (isApiRoute(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Allow access to onboarding routes
  if (req.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.next()
  }

  // Check if user has a family
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/family`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    const hasFamily = data.family !== null

    // If user doesn't have a family and tries to access dashboard, redirect to onboarding
    if (!hasFamily && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/onboarding/family', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Error checking family status:', error)
    // On error, allow the request to proceed
    return NextResponse.next()
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}