'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { format } from 'date-fns'

export function MealPlanner() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // This would typically come from your database
  const meals = [
    { id: 1, name: 'Pasta Carbonara', type: 'DINNER', date: new Date() },
    { id: 2, name: 'Chicken Salad', type: 'LUNCH', date: new Date() },
    { id: 3, name: 'Oatmeal with Fruits', type: 'BREAKFAST', date: new Date() },
  ]

  const mealTypeColors = {
    BREAKFAST: 'bg-yellow-100 text-yellow-800',
    LUNCH: 'bg-green-100 text-green-800',
    DINNER: 'bg-blue-100 text-blue-800',
    SNACK: 'bg-purple-100 text-purple-800',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weekly Meal Plan</CardTitle>
        <Button variant="outline" size="sm">
          Plan Meals
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Today's Meals</h4>
            <div className="space-y-2">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted"
                >
                  <span className="font-medium">{meal.name}</span>
                  <Badge
                    variant="secondary"
                    className={mealTypeColors[meal.type as keyof typeof mealTypeColors]}
                  >
                    {meal.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 