import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface MealCardProps {
  day: string
  meals: {
    [key: string]: string
  }
  isEditMode: boolean
  onMealChange: (day: string, mealType: string, value: string) => void
}

const MEALS = ['BREAKFAST', 'LUNCH', 'DINNER']

export function MealCard({ day, meals, isEditMode, onMealChange }: MealCardProps) {
  return (
    <Card className="h-full bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-semibold text-gray-900">{day}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {MEALS.map((mealType) => (
          <div key={mealType} className="space-y-2">
            <Label className="text-sm font-medium text-gray-500">
              {mealType.charAt(0) + mealType.slice(1).toLowerCase()}
            </Label>
            {isEditMode ? (
              <Input
                type="text"
                value={meals[mealType] || ''}
                onChange={(e) => onMealChange(day, mealType, e.target.value)}
                placeholder={`Enter ${mealType.toLowerCase()}`}
                className="h-9 text-sm"
              />
            ) : (
              <p className="text-sm text-gray-700 min-h-[36px] flex items-center">
                {meals[mealType] || 'No meal planned'}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 