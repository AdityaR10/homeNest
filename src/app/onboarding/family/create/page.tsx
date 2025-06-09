'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateFamilyPage() {
  const router = useRouter()
  const [familyName, setFamilyName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName.trim()) {
      toast.error('Please enter a family name')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: familyName.trim() })
      })

      if (response.ok) {
        toast.success('Family created successfully')
        router.push('/dashboard')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create family')
      }
    } catch (error) {
      console.error('Error creating family:', error)
      toast.error('Failed to create family')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Family</CardTitle>
          <CardDescription>
            Set up your family to start using HomeNest together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="familyName">Family Name</Label>
              <Input
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Enter your family name"
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Family'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 