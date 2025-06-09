'use client'

import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function FamilyOverview() {
  const { user } = useUser()

  // This would typically come from your database
  const familyMembers = [
    { id: 1, name: 'John Doe', role: 'PARENT', imageUrl: '' },
    { id: 2, name: 'Jane Doe', role: 'PARENT', imageUrl: '' },
    { id: 3, name: 'Junior Doe', role: 'CHILD', imageUrl: '' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
              <AvatarFallback>
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user?.fullName}</h3>
              <Badge variant="secondary" className="mt-1">
                {user?.publicMetadata?.role || 'PARENT'}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Family Members</h4>
            <div className="flex -space-x-2">
              {familyMembers.map((member) => (
                <Avatar key={member.id} className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={member.imageUrl} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 