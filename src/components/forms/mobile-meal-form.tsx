'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, X } from "lucide-react"

export function MobileMealForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])

  const cuisineOptions = [
    "Indian", "Italian", "Chinese", "Mexican", "American", 
    "Mediterranean", "Thai", "Japanese", "Korean"
  ]

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Gluten-Free", "Keto", 
    "Low-Carb", "Dairy-Free", "Nut-Free"
  ]

  const toggleSelection = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item))
    } else {
      setter([...list, item])
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>AI Meal Planner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Number of People */}
          <div className="space-y-2">
            <Label>Number of People</Label>
            <Select defaultValue="3">
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num} people</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Days */}
          <div className="space-y-2">
            <Label>Plan Duration</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm">1 Day</Button>
              <Button variant="default" size="sm">3 Days</Button>
              <Button variant="outline" size="sm">7 Days</Button>
            </div>
          </div>

          {/* Cuisine Selection */}
          <div className="space-y-3">
            <Label>Preferred Cuisines</Label>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map(cuisine => (
                <Badge
                  key={cuisine}
                  variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                  className="cursor-pointer h-8 px-3"
                  onClick={() => toggleSelection(cuisine, selectedCuisines, setSelectedCuisines)}
                >
                  {cuisine}
                  {selectedCuisines.includes(cuisine) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label>Dietary Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map(diet => (
                <Badge
                  key={diet}
                  variant={dietaryRestrictions.includes(diet) ? "default" : "outline"}
                  className="cursor-pointer h-8 px-3"
                  onClick={() => toggleSelection(diet, dietaryRestrictions, setDietaryRestrictions)}
                >
                  {diet}
                  {dietaryRestrictions.includes(diet) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Available Ingredients */}
          <div className="space-y-2">
            <Label>Available Ingredients (Optional)</Label>
            <Textarea 
              placeholder="List ingredients you already have..."
              className="min-h-20"
            />
          </div>

          {/* Generate Button */}
          <Button 
            className="w-full h-12 text-lg"
            disabled={isGenerating}
            onClick={() => setIsGenerating(true)}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Meal Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Meal Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}