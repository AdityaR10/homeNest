'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Copy, Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FamilyInviteCodeProps {
  family: {
    id: string
    inviteCode: string | null
    inviteExpiry: Date | null
  }
}

export function FamilyInviteCode({ family }: FamilyInviteCodeProps) {
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false)

  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true)
    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST'
      })
      const data = await response.json()

      if (response.ok) {
        toast.success('New invite code generated')
        window.location.reload()
      } else {
        throw new Error(data.error || 'Failed to generate invite code')
      }
    } catch (error) {
      console.error('Error generating invite code:', error)
      toast.error('Failed to generate invite code')
    } finally {
      setIsGeneratingInvite(false)
    }
  }

  const handleCopyInviteCode = () => {
    if (family.inviteCode) {
      navigator.clipboard.writeText(family.inviteCode)
      toast.success('Invite code copied to clipboard')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Invite Code</Label>
          <p className="text-sm text-muted-foreground">
            {family.inviteExpiry
              ? `Expires on ${format(new Date(family.inviteExpiry), 'PPP')}`
              : 'No active invite code'}
          </p>
        </div>
        <div className="flex gap-2">
          {family.inviteCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInviteCode}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleGenerateInvite}
            disabled={isGeneratingInvite}
          >
            {isGeneratingInvite ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Generate Invite
              </>
            )}
          </Button>
        </div>
      </div>
      {family.inviteCode && (
        <Input
          value={family.inviteCode}
          readOnly
          className="font-mono"
        />
      )}
    </div>
  )
} 