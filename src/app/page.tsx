'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()
  const { isSignedIn } = useAuth()

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push('/dashboard/profile')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to HomeNest
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your AI-powered family management platform. Plan meals, organize activities, and manage your household efficiently.
            </p>
            <div className="flex gap-4 justify-center">
              <SignUpButton mode="modal">
                <Button size="lg" onClick={handleGetStarted}>Get Started</Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline">Sign In</Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">AI Meal Planning</h3>
              <p className="text-muted-foreground">
                Get personalized meal plans based on your family's preferences and dietary needs.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Family Organization</h3>
              <p className="text-muted-foreground">
                Manage family activities, shopping lists, and household tasks in one place.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Assign roles to family members for better coordination and management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
