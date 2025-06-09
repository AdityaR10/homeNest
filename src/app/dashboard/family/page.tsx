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
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { FamilyInviteCode } from '@/components/family/family-invite-code'
import { FamilyJoinRequests } from '@/components/family/family-join-requests'
import { FamilyMembers } from '@/components/family/family-members'

interface FamilyMember {
  id: string
  name: string
  email: string
  isOwner: boolean
}

interface Family {
  id: string
  name: string
  inviteCode: string | null
  inviteExpiry: Date | null
  members: FamilyMember[]
}

export default async function FamilyPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const family = await db.family.findFirst({
    where: {
      members: {
        some: {
          userId
        }
      }
    },
    include: {
      members: {
        include: {
          user: true
        }
      },
      joinRequests: {
        where: {
          status: 'PENDING'
        },
        include: {
          user: true
        }
      }
    }
  })

  if (!family) {
    redirect('/onboarding/family')
  }

  const isOwner = family.members.some(member => member.userId === userId && member.role === 'OWNER')

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Family Management</h1>
        {isOwner && <FamilyInviteCode family={family} />}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
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