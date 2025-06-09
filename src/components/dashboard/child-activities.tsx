'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export function ChildActivities() {
  // This would typically come from your database
  const activities = [
    {
      id: 1,
      name: 'Soccer Practice',
      date: new Date(2024, 2, 20, 17, 0),
      location: 'City Field',
      status: 'CONFIRMED',
    },
    {
      id: 2,
      name: 'Piano Lesson',
      date: new Date(2024, 2, 21, 15, 30),
      location: 'Music School',
      status: 'PENDING',
    },
  ]

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Child Activities</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col space-y-2 p-3 rounded-lg bg-muted"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{activity.name}</h4>
                <Badge
                  variant="secondary"
                  className={statusColors[activity.status as keyof typeof statusColors]}
                >
                  {activity.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{format(activity.date, 'EEEE, MMMM d • h:mm a')}</p>
                <p>{activity.location}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 