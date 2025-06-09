'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface JoinRequest {
  id: string
  userId: string
  user: {
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
  }
  requestedAt: Date
}

interface FamilyJoinRequestsProps {
  requests: JoinRequest[]
}

export function FamilyJoinRequests({ requests }: FamilyJoinRequestsProps) {
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  const handleRequest = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setProcessingRequest(requestId)
    try {
      const response = await fetch('/api/family/join', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          action
        })
      })

      if (response.ok) {
        toast.success(`Request ${action.toLowerCase()}d successfully`)
        window.location.reload()
      } else {
        const data = await response.json()
        throw new Error(data.error || `Failed to ${action.toLowerCase()} request`)
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing request:`, error)
      toast.error(`Failed to ${action.toLowerCase()} request`)
    } finally {
      setProcessingRequest(null)
    }
  }

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No pending join requests
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.user.imageUrl || undefined} />
              <AvatarFallback>
                {request.user.firstName?.[0]}
                {request.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {request.user.firstName} {request.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                Requested {new Date(request.requestedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRequest(request.id, 'REJECT')}
              disabled={processingRequest === request.id}
            >
              {processingRequest === request.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => handleRequest(request.id, 'APPROVE')}
              disabled={processingRequest === request.id}
            >
              {processingRequest === request.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 