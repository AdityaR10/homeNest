'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, User } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FamilyMember {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  isOwner: boolean
}

interface Family {
  id: string
  name: string
  members: FamilyMember[]
}

export default function RolesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [family, setFamily] = useState<Family | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  const fetchFamilyData = async () => {
    try {
      const response = await fetch('/api/family')
      const data = await response.json()

      if (response.ok) {
        setFamily(data.family)
        setIsOwner(data.isOwner)
      } else {
        throw new Error(data.error || 'Failed to fetch family data')
      }
    } catch (error) {
      console.error('Error fetching family data:', error)
      toast.error('Failed to load family data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFamilyData()
  }, [])

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!confirm('Are you sure you want to change this member\'s role?')) return

    setIsUpdating(memberId)
    try {
      const response = await fetch('/api/family/members/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole })
      })

      if (response.ok) {
        setFamily(prev => prev ? {
          ...prev,
          members: prev.members.map(member =>
            member.id === memberId
              ? { ...member, role: newRole as 'OWNER' | 'ADMIN' | 'MEMBER' }
              : member
          )
        } : null)
        toast.success('Role updated successfully')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    } finally {
      setIsUpdating(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!family) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>No Family Found</CardTitle>
            <CardDescription>
              You are not currently part of any family.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Family Roles
          </CardTitle>
          <CardDescription>
            Manage roles and permissions for family members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {member.isOwner ? (
                    <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                      Owner
                    </span>
                  ) : isOwner ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) => handleRoleChange(member.id, value)}
                      disabled={isUpdating === member.id}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MEMBER">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs bg-muted rounded-full">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 