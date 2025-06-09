'use client'

import { useState } from 'react'
import { Loader2, UserPlus, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AddFamilyMemberProps {
  familyId: string
}

export function AddFamilyMember({ familyId }: AddFamilyMemberProps) {
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  const handleGenerateInvite = async () => {
    setIsGeneratingInvite(true)
    try {
      const response = await fetch('/api/family/invite', {
        method: 'POST'
      })
      const data = await response.json()

      if (response.ok) {
        setInviteCode(data.inviteCode)
        toast.success('New invite code generated')
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
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      toast.success('Invite code copied to clipboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Family Member
        </CardTitle>
        <CardDescription>
          Generate an invite code to add new members to your family
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Invite Code</Label>
          <div className="flex gap-2">
            <Input
              value={inviteCode || ''}
              readOnly
              placeholder="Generate an invite code"
              className="font-mono"
            />
            {inviteCode && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyInviteCode}
                title="Copy invite code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Button
          onClick={handleGenerateInvite}
          disabled={isGeneratingInvite}
          className="w-full"
        >
          {isGeneratingInvite ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Generate Invite Code
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          Share this code with the person you want to invite. They can use it to join your family.
        </p>
      </CardContent>
    </Card>
  )
} 