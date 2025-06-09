'use client'

import { useState } from 'react'
import { Loader2, UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface FamilyMember {
  id: string
  name: string
  email: string
  role: string
  isOwner: boolean
  clerkId: string
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
              <AvatarFallback>
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">
                {member.role} • {member.email}
              </p>
            </div>
          </div>
          {isOwner && !member.isOwner && (
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