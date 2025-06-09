import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Pencil, X, Check, Wand2, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { format, endOfWeek } from 'date-fns'

interface MealPlanHeaderProps {
  weekStart: Date
  isEditMode: boolean
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  canEdit: boolean
  onWeekChange: (direction: 'prev' | 'next') => void
  onEditToggle: () => void
  onGeneratePlan: () => void
  onSave: () => void
  onClearWeek: () => void
}

export function MealPlanHeader({
  weekStart,
  isEditMode,
  isLoading,
  isSaving,
  hasUnsavedChanges,
  canEdit,
  onWeekChange,
  onEditToggle,
  onGeneratePlan,
  onSave,
  onClearWeek,
}: MealPlanHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Meal Planner</h1>
        <p className="text-gray-500 mt-1">
          Week of {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onWeekChange('prev')}
          disabled={isLoading}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onWeekChange('next')}
          disabled={isLoading}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {canEdit && (
          <>
            <Button
              variant="outline"
              onClick={onEditToggle}
              disabled={isLoading}
              className="h-9"
            >
              {isEditMode ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClearWeek}
              disabled={isLoading}
              className="h-9"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Week
            </Button>
            <Button
              onClick={onGeneratePlan}
              disabled={isLoading}
              className="h-9"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Plan
            </Button>
            {hasUnsavedChanges && (
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="h-9"
              >
                {isSaving ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
} 