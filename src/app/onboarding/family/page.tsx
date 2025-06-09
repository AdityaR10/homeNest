'use client'

import { useRouter } from 'next/navigation'
import { Users, UserPlus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function FamilySetupPage() {
  const router = useRouter()

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to HomeNest</h1>
        <p className="text-muted-foreground">
          Let's get your family set up. You can either create a new family or join an existing one.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create a New Family
            </CardTitle>
            <CardDescription>
              Start a new family and invite others to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/onboarding/family/create')}
            >
              Create Family
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Join Existing Family
            </CardTitle>
            <CardDescription>
              Join a family using an invite code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push('/onboarding/family/join')}
            >
              Join Family
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        You can change these settings later in your family management page.
      </p>
    </div>
  )
} 