'use client'

import { useState, useEffect } from 'react'
import { startOfWeek, endOfWeek, subDays, addDays, format } from 'date-fns'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/usePermissions'
import { MealCard } from '@/components/meals/meal-card'
import { MealPlanHeader } from '@/components/meals/meal-plan-header'
import { GenerateMealPlanDialog } from '@/components/meals/generate-meal-plan-dialog'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Spinner } from '@/components/ui/spinner'

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
  [day: string]: {
    [mealType: string]: MealDetails | string | null
  }
}

export default function MealPlannerPage() {
  const { permissions, isLoading: isLoadingPermissions } = usePermissions()
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
  const getMealTitle = (meal: MealDetails | string | null): string => {
    if (meal === null) return ''
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
    if (!isLoadingPermissions) {
      loadMealPlan()
    }
  }, [weekStart, isLoadingPermissions])

  const loadMealPlan = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/mealPlan?weekStart=${weekStart.toISOString()}`)
      if (!response.ok) throw new Error('Failed to load meal plan')
      
      const data = await response.json()
      if (data.success) {
        setMealPlan(data.mealPlan || initializeEmptyMealPlan())
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
    if (!permissions.canEditMealPlans) {
      toast.error('You do not have permission to edit meal plans')
      return
    }

    setIsSaving(true)
    try {
      // Format the meal plan data for the API
      const formattedMealPlan = Object.entries(mealPlan).reduce((acc, [day, dayMeals]) => {
        acc[day] = Object.entries(dayMeals).reduce((dayAcc, [mealType, meal]) => {
          if (meal) {
            const mealDate = new Date(weekStart)
            mealDate.setDate(weekStart.getDate() + DAYS.indexOf(day))
            
            dayAcc[mealType] = {
              title: typeof meal === 'string' ? meal : meal.title,
              mealType,
              date: mealDate.toISOString(),
              description: typeof meal === 'string' ? '' : (meal.description || ''),
              ingredients: typeof meal === 'string' ? [] : (meal.ingredients || []),
              instructions: typeof meal === 'string' ? '' : (meal.instructions || ''),
              calories: typeof meal === 'string' ? null : (meal.calories || null),
              cuisine: typeof meal === 'string' ? '' : (meal.cuisine || ''),
              isAiGenerated: false
            }
          }
          return dayAcc
        }, {} as Record<string, any>)
        return acc
      }, {} as Record<string, Record<string, any>>)

      const response = await fetch('/api/mealPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
          mealPlan: formattedMealPlan
        })
      })

      if (!response.ok) throw new Error('Failed to save meal plan')

      const data = await response.json()
      if (data.success) {
        toast.success('Meal plan saved successfully')
        setHasUnsavedChanges(false)
        loadMealPlan() // Reload to get the saved data
      }
    } catch (error) {
      console.error('Error saving meal plan:', error)
      toast.error('Failed to save meal plan')
    } finally {
      setIsSaving(false)
    }
  }

  const clearWeekMealPlan = async () => {
    if (!permissions.canDeleteMealPlans) {
      toast.error('You do not have permission to delete meal plans')
      return
    }

    setIsClearing(true)
    try {
      const response = await fetch(`/api/mealPlan?weekStart=${weekStart.toISOString()}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to clear meal plan')

      const data = await response.json()
      if (data.success) {
        toast.success('Meal plan cleared successfully')
        setMealPlan(initializeEmptyMealPlan())
        setHasUnsavedChanges(false)
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
    if (!permissions.canGenerateAIMealPlans) {
      toast.error('You do not have permission to generate meal plans')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/generateMealPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuisine,
          numberOfPeople,
          dietaryRestrictions,
          availableIngredients: availableIngredients.split(',').map(i => i.trim()).filter(Boolean),
          numberOfDays: 7
        })
      })

      if (!response.ok) throw new Error('Failed to generate meal plan')

      const data = await response.json()
      if (data.success && data.meals) {
        // Format the generated meals into the meal plan structure
        const newMealPlan = initializeEmptyMealPlan()
        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
        const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER']

        // Group meals by meal type
        const mealsByType = {
          BREAKFAST: data.meals.filter((meal: any) => meal.mealType === 'BREAKFAST'),
          LUNCH: data.meals.filter((meal: any) => meal.mealType === 'LUNCH'),
          DINNER: data.meals.filter((meal: any) => meal.mealType === 'DINNER')
        }

        // Distribute meals across the week
        days.forEach((day, dayIndex) => {
          mealTypes.forEach(mealType => {
            const mealsOfType = mealsByType[mealType as keyof typeof mealsByType]
            if (mealsOfType && mealsOfType[dayIndex]) {
              newMealPlan[day][mealType] = mealsOfType[dayIndex]
            }
          })
        })

        // Save the generated meal plan
        const saveResponse = await fetch('/api/mealPlan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekStart: weekStart.toISOString(),
            mealPlan: newMealPlan
          })
        })

        if (!saveResponse.ok) throw new Error('Failed to save generated meal plan')

        const saveData = await saveResponse.json()
        if (saveData.success) {
          toast.success('Meal plan generated and saved successfully')
          setMealPlan(newMealPlan)
          setHasUnsavedChanges(false)
          setIsDialogOpen(false)
        }
      } else {
        throw new Error('Invalid response format from meal generation API')
      }
    } catch (error) {
      console.error('Error generating meal plan:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate meal plan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMealChange = (day: string, mealType: string, value: string) => {
    if (!permissions.canEditMealPlans) {
      toast.error('You do not have permission to edit meal plans')
      return
    }

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

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
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
          if (!permissions.canEditMealPlans) {
            toast.error('You do not have permission to edit meal plans')
            return
          }
          setIsEditMode(!isEditMode)
          if (isEditMode) {
            setHasUnsavedChanges(false)
          }
        }}
        onGeneratePlan={() => {
          if (!permissions.canGenerateAIMealPlans) {
            toast.error('You do not have permission to generate meal plans')
            return
          }
          setIsDialogOpen(true)
        }}
        onSave={savePlan}
        onClearWeek={() => {
          if (!permissions.canDeleteMealPlans) {
            toast.error('You do not have permission to delete meal plans')
            return
          }
          setIsClearDialogOpen(true)
        }}
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
    </div>
  )
}