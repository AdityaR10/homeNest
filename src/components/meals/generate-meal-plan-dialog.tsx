import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Wand2 } from 'lucide-react'

const CUISINES = [
  'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai', 'Mediterranean',
  'American', 'French', 'Korean', 'Vietnamese', 'Greek', 'Spanish', 'German'
]

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' }
]

interface GenerateMealPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  cuisine: string
  numberOfPeople: number
  dietaryRestrictions: string[]
  availableIngredients: string
  onCuisineChange: (value: string) => void
  onNumberOfPeopleChange: (value: number) => void
  onDietaryRestrictionsChange: (restrictions: string[]) => void
  onAvailableIngredientsChange: (value: string) => void
  onGenerate: () => void
}

export function GenerateMealPlanDialog({
  open,
  onOpenChange,
  isLoading,
  cuisine,
  numberOfPeople,
  dietaryRestrictions,
  availableIngredients,
  onCuisineChange,
  onNumberOfPeopleChange,
  onDietaryRestrictionsChange,
  onAvailableIngredientsChange,
  onGenerate
}: GenerateMealPlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate New Meal Plan</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Cuisine</Label>
            <Select value={cuisine} onValueChange={onCuisineChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                {CUISINES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Number of People</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[numberOfPeople]}
                onValueChange={(value) => onNumberOfPeopleChange(value[0])}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-8 text-center">{numberOfPeople}</span>
            </div>
          </div>

          <div>
            <Label>Dietary Restrictions</Label>
            <div className="grid grid-cols-2 gap-2">
              {DIETARY_RESTRICTIONS.map((restriction) => (
                <div key={restriction.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={restriction.id}
                    checked={dietaryRestrictions.includes(restriction.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onDietaryRestrictionsChange([...dietaryRestrictions, restriction.id])
                      } else {
                        onDietaryRestrictionsChange(dietaryRestrictions.filter(id => id !== restriction.id))
                      }
                    }}
                  />
                  <Label htmlFor={restriction.id}>{restriction.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Available Ingredients (comma-separated)</Label>
            <Textarea
              value={availableIngredients}
              onChange={(e) => onAvailableIngredientsChange(e.target.value)}
              placeholder="e.g., chicken, rice, tomatoes"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={onGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Plan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 