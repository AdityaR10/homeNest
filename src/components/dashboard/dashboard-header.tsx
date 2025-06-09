'use client'

import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function DashboardHeader() {
  const { user } = useUser()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    if (user) {
      toast.success(`Welcome back, ${user.firstName}!`)
    }

    return () => clearInterval(timer)
  }, [user])

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">
        Welcome back, {user?.firstName}!
      </h1>
      <p className="text-muted-foreground">
        {format(currentTime, 'EEEE, MMMM d, yyyy • h:mm a')}
      </p>
    </div>
  )
} 