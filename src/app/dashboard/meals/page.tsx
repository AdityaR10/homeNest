'use client'

import { useState, useEffect } from 'react'
import { startOfWeek, endOfWeek, subDays, addDays, format } from 'date-fns'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { usePermissions } from '@/hooks/usePermissions'
import { MealCard } from '@/components/meals/meal-card'
import { MealPlanHeader } from '@/components/meals/meal-plan-header'
import { GenerateMealPlanDialog } from '@/components/meals/generate-meal-plan-dialog'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Trash2 } from 'lucide-react'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const MEALS = ['BREAKFAST', 'LUNCH', 'DINNER']

interface MealDetails {
  id?: string
  title: string
  description?: string
  mealType: string
  date?: string
  ingredients?: string[]
  instructions?: string
  calories?: number | null
  cuisine?: string
  isAiGenerated?: boolean
  familyId?: string
  createdByClerkId?: string
  createdAt?: string
  updatedAt?: string
}

interface MealPlan {
  [key: string]: {
    [key: string]: MealDetails | string
  }
}

export default function MealPlannerPage() {
  const { user } = useUser()
  const { permissions } = usePermissions()
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [mealPlan, setMealPlan] = useState<MealPlan>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [cuisine, setCuisine] = useState('')
  const [numberOfPeople, setNumberOfPeople] = useState(4)
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [availableIngredients, setAvailableIngredients] = useState('')

  // Initialize empty meal plan structure
  const initializeEmptyMealPlan = () => {
    const emptyPlan: MealPlan = {}
    DAYS.forEach(day => {
      emptyPlan[day] = {}
      MEALS.forEach(meal => {
        emptyPlan[day][meal] = ''
      })
    })
    return emptyPlan
  }

  // Helper function to get meal title for display
  const getMealTitle = (meal: MealDetails | string): string => {
    if (typeof meal === 'string') return meal
    return meal?.title || ''
  }

  // Helper function to get meal object for saving
  const getMealObject = (meal: MealDetails | string): MealDetails | null => {
    if (typeof meal === 'string') {
      return meal ? { title: meal, mealType: '' } : null
    }
    return meal
  }

  // Load meal plan
  useEffect(() => {
    loadMealPlan()
  }, [weekStart])

  const loadMealPlan = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/mealPlan?weekStart=${weekStart.toISOString()}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.mealPlan) {
          setMealPlan(data.mealPlan)
        } else {
          setMealPlan(initializeEmptyMealPlan())
        }
      } else {
        setMealPlan(initializeEmptyMealPlan())
      }
    } catch (error) {
      console.error('Error loading meal plan:', error)
      toast.error('Failed to load meal plan')
      setMealPlan(initializeEmptyMealPlan())
    } finally {
      setIsLoading(false)
    }
  }

  const savePlan = async () => {
    setIsSaving(true)
    try {
      // Prepare the meal plan data with complete meal objects
      const mealPlanToSave = Object.keys(mealPlan).reduce((acc, day) => {
        acc[day] = Object.keys(mealPlan[day]).reduce((dayAcc, mealType) => {
          const meal = mealPlan[day][mealType]
          const mealObject = getMealObject(meal)
          dayAcc[mealType] = mealObject || ''
          return dayAcc
        }, {} as any)
        return acc
      }, {} as any)

      const response = await fetch('/api/mealPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
          mealPlan: mealPlanToSave
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setHasUnsavedChanges(false)
          toast.success('Meal plan saved successfully!')
        } else {
          toast.error(data.error || 'Failed to save meal plan')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save meal plan')
      }
    } catch (error) {
      console.error('Error saving meal plan:', error)
      toast.error('Failed to save meal plan')
    } finally {
      setIsSaving(false)
    }
  }

  const clearWeekMealPlan = async () => {
    setIsClearing(true)
    try {
      const response = await fetch(`/api/mealPlan/clear?weekStartDate=${weekStart.toISOString()}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
  
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMealPlan(initializeEmptyMealPlan())
          setHasUnsavedChanges(false)
          toast.success(data.message || 'Meal plan cleared successfully!')
        } else {
          toast.error(data.error || 'Failed to clear meal plan')
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to clear meal plan')
      }
    } catch (error) {
      console.error('Error clearing meal plan:', error)
      toast.error('Failed to clear meal plan')
    } finally {
      setIsClearing(false)
      setIsClearDialogOpen(false)
    }
  }

  const handleGeneratePlan = async () => {
    // Check if there are existing meals (non-empty values)
    const hasExistingMeals = Object.values(mealPlan).some(dayMeals => 
      Object.values(dayMeals).some(meal => {
        const title = getMealTitle(meal)
        return title && title.trim() !== ''
      })
    )
    
    if (hasExistingMeals) {
      setIsReplaceDialogOpen(true)
      return
    }

    await generateNewPlan()
  }

  const generateNewPlan = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generateMealPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuisine: [cuisine],
          dietaryRestrictions,
          numberOfPeople,
          numberOfDays: 7,
          availableIngredients: availableIngredients.split(',').map(i => i.trim()).filter(Boolean),
          excludeIngredients: []
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate meal plan')
      }

      const data = await response.json()
      if (data.success && data.meals) {
        // Initialize new meal plan structure
        const newPlan = initializeEmptyMealPlan()
        
        // Group meals by meal type
        const mealsByType = {
          BREAKFAST: data.meals.filter((meal: MealDetails) => meal.mealType === 'BREAKFAST'),
          LUNCH: data.meals.filter((meal: MealDetails) => meal.mealType === 'LUNCH'),
          DINNER: data.meals.filter((meal: MealDetails) => meal.mealType === 'DINNER')
        }

        // Distribute meals across the week (7 days)
        DAYS.forEach((day, dayIndex) => {
          MEALS.forEach(mealType => {
            const mealsOfType = mealsByType[mealType as keyof typeof mealsByType]
            if (mealsOfType && mealsOfType[dayIndex]) {
              // Store the complete meal object
              newPlan[day][mealType] = {
                ...mealsOfType[dayIndex],
                // Update the date to match the actual day of the week
                date: addDays(weekStart, dayIndex).toISOString()
              }
            }
          })
        })

        setMealPlan(newPlan)
        setHasUnsavedChanges(true)
        setIsDialogOpen(false)
        toast.success('Meal plan generated successfully!')
        
        // Log for debugging
        console.log('Generated meal plan:', newPlan)
        
      } else {
        throw new Error('Invalid response format from meal generation API')
      }
    } catch (error) {
      console.error('Error generating meal plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate meal plan')
    } finally {
      setIsLoading(false)
      setIsReplaceDialogOpen(false)
    }
  }

  const handleMealChange = (day: string, mealType: string, value: string) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: value // This will be a string when manually edited
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to change weeks?')) {
        return
      }
    }
    const newWeekStart = direction === 'prev' ? subDays(weekStart, 7) : addDays(weekStart, 7)
    setWeekStart(newWeekStart)
    setHasUnsavedChanges(false)
  }

  if (!permissions.canViewMealPlans) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view meal plans.</p>
        </div>
      </div>
    )
  }

  const weekRange = `${format(weekStart, 'MMM d')} - ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}`

  // Prepare meals data for display (only titles)
  const displayMealPlan = Object.keys(mealPlan).reduce((acc, day) => {
    acc[day] = Object.keys(mealPlan[day]).reduce((dayAcc, mealType) => {
      const meal = mealPlan[day][mealType]
      dayAcc[mealType] = getMealTitle(meal)
      return dayAcc
    }, {} as Record<string, string>)
    return acc
  }, {} as Record<string, Record<string, string>>)

  return (
    <div className="container mx-auto px-4 py-8">
      <MealPlanHeader
        weekStart={weekStart}
        isEditMode={isEditMode}
        isLoading={isLoading}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        canEdit={permissions.canEditMealPlans}
        onWeekChange={handleWeekChange}
        onEditToggle={() => {
          setIsEditMode(!isEditMode)
          if (isEditMode) {
            setHasUnsavedChanges(false)
          }
        }}
        onGeneratePlan={() => setIsDialogOpen(true)}
        onSave={savePlan}
        onClearWeek={() => setIsClearDialogOpen(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {DAYS.map((day) => (
          <MealCard
            key={day}
            day={day}
            meals={displayMealPlan[day] || {}}
            isEditMode={isEditMode}
            onMealChange={handleMealChange}
          />
        ))}
      </div>

      <GenerateMealPlanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isLoading={isLoading}
        cuisine={cuisine}
        numberOfPeople={numberOfPeople}
        dietaryRestrictions={dietaryRestrictions}
        availableIngredients={availableIngredients}
        onCuisineChange={setCuisine}
        onNumberOfPeopleChange={setNumberOfPeople}
        onDietaryRestrictionsChange={setDietaryRestrictions}
        onAvailableIngredientsChange={setAvailableIngredients}
        onGenerate={handleGeneratePlan}
      />

      <ConfirmationDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        title="Clear Meal Plan"
        description={`This will permanently delete all meals for the week of ${weekRange}. This action cannot be undone.`}
        confirmText="Clear Week"
        variant="destructive"
        isLoading={isClearing}
        onConfirm={clearWeekMealPlan}
      />

      <ConfirmationDialog
        open={isReplaceDialogOpen}
        onOpenChange={setIsReplaceDialogOpen}
        title="Replace Meal Plan"
        description={`You already have meals planned for this week. Generating a new plan will replace all existing meals for the week of ${weekRange}. Do you want to continue?`}
        confirmText="Replace Plan"
        isLoading={isLoading}
        onConfirm={generateNewPlan}
      />
    </div>
  )
}