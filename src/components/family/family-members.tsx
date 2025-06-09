'use client'

import { useState } from 'react'
import { Loader2, UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface FamilyMember {
  id: string
  userId: string
  role: 'OWNER' | 'MEMBER'
  user: {
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
  }
  joinedAt: Date
}

interface FamilyMembersProps {
  members: FamilyMember[]
  isOwner: boolean
}

export function FamilyMembers({ members, isOwner }: FamilyMembersProps) {
  const [removingMember, setRemovingMember] = useState<string | null>(null)

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setRemovingMember(memberId)
    try {
      const response = await fetch('/api/family/members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memberId })
      })

      if (response.ok) {
        toast.success('Member removed successfully')
        window.location.reload()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error('Failed to remove member')
    } finally {
      setRemovingMember(null)
    }
  }

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={member.user.imageUrl || undefined} />
              <AvatarFallback>
                {member.user.firstName?.[0]}
                {member.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {member.user.firstName} {member.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {member.role === 'OWNER' ? 'Owner' : 'Member'} • Joined{' '}
                {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {isOwner && member.role !== 'OWNER' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemoveMember(member.id)}
              disabled={removingMember === member.id}
            >
              {removingMember === member.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
} 