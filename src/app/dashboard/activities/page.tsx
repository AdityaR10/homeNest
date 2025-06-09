'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2,
  CheckCircle2,
  Clock
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
// app/dashboard/activities/page.tsx - Update the interface
interface Activity {
  id: string
  title: string
  description: string
  date: string          // Single date field instead of startDate/endDate
  location: string
  status: string        // Simple string instead of enum
  createdBy: {
    firstName: string
    lastName: string
  }
}


export default function ActivitiesPage() {
  // State management
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Add/Edit dialog state
  const [showDialog, setShowDialog] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    location: ''
  })

  // Load activities on mount
  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('Failed to load activities')
      
      const data = await response.json()
      if (data.success) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Failed to load activities')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`)
      
      const activityData = {
        ...formData,
        date: dateTime.toISOString()
      }

      const url = editingActivity 
        ? `/api/activities/${editingActivity.id}`
        : '/api/activities'
      
      const method = editingActivity ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      })

      if (!response.ok) throw new Error('Failed to save activity')

      const data = await response.json()
      if (data.success) {
        toast.success(editingActivity ? 'Activity updated!' : 'Activity created!')
        setShowDialog(false)
        loadActivities()
      }
    } catch (error) {
      console.error('Error saving activity:', error)
      toast.error('Failed to save activity')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete activity')

      const data = await response.json()
      if (data.success) {
        toast.success('Activity deleted!')
        loadActivities()
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.error('Failed to delete activity')
    }
  }

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'pending' ? 'completed' : 'pending'
        })
      })

      if (!response.ok) throw new Error('Failed to update activity status')

      const data = await response.json()
      if (data.success) {
        toast.success('Activity status updated!')
        loadActivities()
      }
    } catch (error) {
      console.error('Error updating activity status:', error)
      toast.error('Failed to update activity status')
    }
  }

  const openEditDialog = (activity: Activity) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      date: format(new Date(activity.date), 'yyyy-MM-dd'),
      time: format(new Date(activity.date), 'HH:mm'),
      location: activity.location || ''
    })
    setShowDialog(true)
  }

  const openAddDialog = () => {
    setEditingActivity(null)
    setFormData({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      location: ''
    })
    setShowDialog(true)
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <div>
            <h1 className="text-3xl font-bold">Family Activities</h1>
            <p className="text-muted-foreground">
              Manage your family's activities and events
            </p>
          </div>
        </div>

        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Activities
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No activities planned yet. Click "Add Activity" to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{activity.title}</h3>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(activity.date), 'MMM dd, yyyy h:mm a')}
                      </div>
                      
                      {activity.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {activity.location}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(activity.id, activity.status)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(activity)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(activity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingActivity ? 'Edit Activity' : 'Add Activity'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter activity title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter activity description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter activity location"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {editingActivity ? 'Update' : 'Create'} Activity
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 