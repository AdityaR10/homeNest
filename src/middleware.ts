import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

const publicRoutes = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)"
])

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware(async (auth, req) => {
  // Allow access to public routes
  if (publicRoutes(req)) {
    return;
  }

  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in")
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}