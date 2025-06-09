'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Copy, Users, UserPlus, UserMinus } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@clerk/nextjs'
import { FamilyInviteCode } from '@/components/family/family-invite-code'
import { FamilyJoinRequests } from '@/components/family/family-join-requests'
import { FamilyMembers } from '@/components/family/family-members'
import { AddFamilyMember } from '@/components/family/add-family-member'

interface FamilyMember {
  id: string
  name: string
  email: string
  role: string
  isOwner: boolean
  clerkId: string
}

interface Family {
  id: string
  name: string
  inviteCode: string | null
  inviteExpiry: Date | null
  members: FamilyMember[]
  joinRequests: any[]
}

export default function FamilyPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [family, setFamily] = useState<Family | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    const fetchFamily = async () => {
      try {
        const response = await fetch('/api/family')
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch family')
        }
        
        setFamily(data.family)
        setIsOwner(data.isOwner)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch family')
        toast.error('Failed to load family information')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFamily()
  }, [userId, router])

  if (!userId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user doesn't have a family, show options to create or join
  if (!family) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Family Management</h1>
          <p className="text-muted-foreground">
            You're not part of a family yet. Create a new family or join an existing one.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
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
      </div>
    )
  }

  // User is part of a family, show family management UI
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Management</h1>
        {isOwner && <FamilyInviteCode family={family} />}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>View and manage your family members</CardDescription>
            </CardHeader>
            <CardContent>
              <FamilyMembers members={family.members} isOwner={isOwner} />
            </CardContent>
          </Card>

          {isOwner && (
            <AddFamilyMember familyId={family.id} />
          )}
        </div>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Join Requests</CardTitle>
              <CardDescription>Manage pending join requests</CardDescription>
            </CardHeader>
            <CardContent>
              <FamilyJoinRequests requests={family.joinRequests} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 