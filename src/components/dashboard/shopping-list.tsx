'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export function ShoppingList() {
  // This would typically come from your database
  const items = [
    { id: 1, name: 'Milk', quantity: '1 gallon', category: 'Dairy', isPurchased: false },
    { id: 2, name: 'Bread', quantity: '2 loaves', category: 'Bakery', isPurchased: false },
    { id: 3, name: 'Eggs', quantity: '1 dozen', category: 'Dairy', isPurchased: true },
    { id: 4, name: 'Apples', quantity: '5 lbs', category: 'Produce', isPurchased: false },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shopping List</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.isPurchased}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                    item.isPurchased ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {item.name}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {item.quantity}
                </span>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 