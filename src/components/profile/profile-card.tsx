'use client'

import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileCard() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
            <AvatarFallback>
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{user.fullName}</h3>
            <p className="text-sm text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">Member since</p>
            <p className="text-sm text-muted-foreground">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Last sign in</p>
            <p className="text-sm text-muted-foreground">
              {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 