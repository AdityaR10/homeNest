'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { BackButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Wand2, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Save,
  AlertCircle,
  Calendar,
  Edit
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { usePermissions } from '@/hooks/usePermissions'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface ShoppingItem {
  id?: string
  name: string
  quantity: string
  category: string
  isPurchased: boolean
  isManual?: boolean
}

interface MealPlan {
  id: string
  title: string
  mealType: string
  date: string
  ingredients: string[]
}

export default function ShoppingListPage() {
  const { permissions, isLoading: isLoadingPermissions } = usePermissions()
  const [currentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  
  // State management
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([])
  const [isLoadingMeals, setIsLoadingMeals] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [hasSavedList, setHasSavedList] = useState(false)
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false)
  
  // Add item dialog state
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('Other')

  // Load current week's meal plan on mount
  useEffect(() => {
    if (!isLoadingPermissions) {
      loadCurrentWeekMealPlan()
      loadSavedShoppingList()
    }
  }, [isLoadingPermissions])

  const loadCurrentWeekMealPlan = async () => {
    setIsLoadingMeals(true)
    try {
      const response = await fetch(`/api/mealPlan?weekStart=${currentWeekStart.toISOString()}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.mealPlan) {
          // Convert structured format to flat array
          const flatMealPlans: MealPlan[] = []
          
          Object.entries(data.mealPlan).forEach(([day, dayMeals]: [string, any]) => {
            Object.entries(dayMeals).forEach(([mealType, meal]: [string, any]) => {
              if (meal && typeof meal === 'object' && meal.id) {
                flatMealPlans.push({
                  id: meal.id,
                  title: meal.title,
                  mealType: meal.mealType,
                  date: meal.date,
                  ingredients: meal.ingredients || []
                })
              }
            })
          })
          
          console.log('Loaded meal plans:', flatMealPlans)
          setMealPlans(flatMealPlans)
        } else {
          setMealPlans([])
        }
      }
    } catch (error) {
      console.error('Error loading meal plans:', error)
      toast.error('Failed to load meal plans')
    } finally {
      setIsLoadingMeals(false)
    }
  }

  const loadSavedShoppingList = async () => {
    try {
      const response = await fetch(`/api/shopping?weekStart=${currentWeekStart.toISOString()}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.shoppingList && data.shoppingList.items) {
          setShoppingItems(data.shoppingList.items)
          setHasSavedList(true)
          setIsEditMode(false) // Ensure we're not in edit mode when loading saved list
        } else {
          setHasSavedList(false)
        }
      }
    } catch (error) {
      console.error('Error loading shopping list:', error)
    }
  }

  const generateShoppingList = () => {
    if (!permissions.canCreateShoppingLists) {
      toast.error('You do not have permission to create shopping lists')
      return
    }

    if (mealPlans.length === 0) {
      toast.error('No meal plan available for this week')
      return
    }

    setIsGenerating(true)
    
    try {
      // Extract all ingredients from meal plans
      const allIngredients: string[] = []
      mealPlans.forEach(meal => {
        if (meal.ingredients && Array.isArray(meal.ingredients)) {
          allIngredients.push(...meal.ingredients)
        }
      })

      // Remove duplicates and create shopping items
      const uniqueIngredients = [...new Set(allIngredients.filter(ingredient => ingredient && ingredient.trim()))]
      const generatedItems: ShoppingItem[] = uniqueIngredients.map(ingredient => ({
        name: ingredient.trim(),
        quantity: '1',
        category: categorizeIngredient(ingredient),
        isPurchased: false
      }))

      setShoppingItems(generatedItems)
      setIsEditMode(true)
      setHasUnsavedChanges(true)
      setHasSavedList(false)
      toast.success(`Shopping list generated with ${generatedItems.length} items!`)
    } catch (error) {
      console.error('Error generating shopping list:', error)
      toast.error('Failed to generate shopping list')
    } finally {
      setIsGenerating(false)
    }
  }

  const categorizeIngredient = (ingredient: string): string => {
    const categories = {
      'Vegetables': ['tomato', 'onion', 'garlic', 'carrot', 'potato', 'spinach', 'lettuce', 'eggplant', 'cauliflower', 'peas', 'beans', 'cucumber'],
      'Fruits': ['apple', 'banana', 'orange', 'lemon', 'lime', 'mango'],
      'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'lamb', 'mutton'],
      'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs', 'paneer'],
      'Grains & Cereals': ['rice', 'bread', 'pasta', 'flour', 'wheat', 'oats', 'lentils', 'chickpeas', 'beans'],
      'Spices & Condiments': ['salt', 'pepper', 'turmeric', 'cumin', 'coriander', 'chili', 'garam masala', 'spices'],
      'Pantry': ['oil', 'vinegar', 'sugar', 'honey', 'ghee']
    }

    const lowerIngredient = ingredient.toLowerCase()
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => lowerIngredient.includes(item.toLowerCase()))) {
        return category
      }
    }
    return 'Other'
  }

  const saveShoppingList = async () => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: currentWeekStart.toISOString(),
          items: shoppingItems
        })
      })

      if (!response.ok) throw new Error('Failed to save shopping list')

      const data = await response.json()
      if (data.success) {
        setHasUnsavedChanges(false)
        setIsEditMode(false)
        setHasSavedList(true)
        toast.success('Shopping list saved successfully')
      }
    } catch (error) {
      console.error('Error saving shopping list:', error)
      toast.error('Failed to save shopping list')
    } finally {
      setIsSaving(false)
    }
  }

  const clearShoppingList = async () => {
    if (!permissions.canDeleteShoppingLists) {
      toast.error('You do not have permission to delete shopping lists')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/shopping?weekStart=${currentWeekStart.toISOString()}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to clear shopping list')

      const data = await response.json()
      if (data.success) {
        setShoppingItems([])
        setHasSavedList(false)
        setHasUnsavedChanges(false)
        setIsEditMode(false)
        toast.success('Shopping list cleared successfully')
      }
    } catch (error) {
      console.error('Error clearing shopping list:', error)
      toast.error('Failed to clear shopping list')
    } finally {
      setIsDeleting(false)
      setIsClearDialogOpen(false)
    }
  }

  const resetShoppingList = () => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to reset?')
      if (!confirm) return
    }
    
    setShoppingItems([])
    setHasUnsavedChanges(false)
    setIsEditMode(true)
    setHasSavedList(false)
    toast.info('Shopping list reset')
  }

  const toggleItemPurchased = async (index: number) => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    const updatedItems = [...shoppingItems]
    updatedItems[index].isPurchased = !updatedItems[index].isPurchased
    setShoppingItems(updatedItems)
    
    if (hasSavedList && !isEditMode) {
      try {
        await fetch('/api/shopping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekStart: currentWeekStart.toISOString(),
            items: updatedItems
          })
        })
      } catch (error) {
        console.error('Error updating purchase status:', error)
      }
    } else {
      setHasUnsavedChanges(true)
    }
  }

  const updateItemQuantity = (index: number, quantity: string) => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    const updatedItems = [...shoppingItems]
    updatedItems[index].quantity = quantity
    setShoppingItems(updatedItems)
    setHasUnsavedChanges(true)
  }

  const updateItemCategory = (index: number, category: string) => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    const updatedItems = [...shoppingItems]
    updatedItems[index].category = category
    setShoppingItems(updatedItems)
    setHasUnsavedChanges(true)
  }

  const removeItem = (index: number) => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    const updatedItems = shoppingItems.filter((_, i) => i !== index)
    setShoppingItems(updatedItems)
    setHasUnsavedChanges(true)
  }

  const addManualItem = () => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    if (!newItemName.trim()) return

    const newItem: ShoppingItem = {
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || '1',
      category: newItemCategory,
      isPurchased: false,
      isManual: true
    }

    setShoppingItems([...shoppingItems, newItem])
    setHasUnsavedChanges(true)
    setNewItemName('')
    setNewItemQuantity('')
    setNewItemCategory('Other')
    setShowAddDialog(false)
    toast.success('Item added to shopping list')
  }

  const handleEditMode = () => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    setIsEditMode(true)
    setHasUnsavedChanges(false)
  }

  const handleCancelEdit = () => {
    if (!permissions.canEditShoppingLists) {
      toast.error('You do not have permission to edit shopping lists')
      return
    }

    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to cancel?')
      if (!confirm) return
    }
    
    setIsEditMode(false)
    setHasUnsavedChanges(false)
    loadSavedShoppingList()
  }

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!permissions.canViewShoppingLists) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view shopping lists.</p>
        </div>
      </div>
    )
  }

  // No meal plan state
  if (!isLoadingMeals && mealPlans.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <h1 className="text-3xl font-bold">Shopping List</h1>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Meal Plan Found</h3>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              You need to create a meal plan for this week before generating a shopping list.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/meals'}>
              Create Meal Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard" />
          <div>
            <h1 className="text-3xl font-bold">Shopping List</h1>
            <p className="text-muted-foreground">
              Week of {format(currentWeekStart, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {permissions.canCreateShoppingLists && (
            <Button 
              onClick={generateShoppingList} 
              disabled={isGenerating || mealPlans.length === 0}
              variant="default"
            >
              {isGenerating ? <Spinner className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate from Meals
            </Button>
          )}
        </div>
      </div>

      {/* Meal Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Meals ({mealPlans.length} meals)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {mealPlans.slice(0, 6).map((meal) => (
              <div key={meal.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Badge variant="outline" className="text-xs">
                  {meal.mealType}
                </Badge>
                <span className="text-sm truncate flex-1">{meal.title}</span>
              </div>
            ))}
            {mealPlans.length > 6 && (
              <div className="text-sm text-muted-foreground p-2">
                +{mealPlans.length - 6} more meals
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping List
              {shoppingItems.length > 0 && (
                <Badge variant="secondary">
                  {shoppingItems.filter(item => !item.isPurchased).length} of {shoppingItems.length} items
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex gap-2">
              {isEditMode && permissions.canEditShoppingLists && (
                <>
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Item Name</Label>
                          <Input
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Enter item name"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(e.target.value)}
                            placeholder="1 kg, 2 pcs, etc."
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <select 
                            value={newItemCategory}
                            onChange={(e) => setNewItemCategory(e.target.value)}
                            className="w-full p-2 border rounded"
                          >
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Meat & Seafood">Meat & Seafood</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Grains & Cereals">Grains & Cereals</option>
                            <option value="Spices & Condiments">Spices & Condiments</option>
                            <option value="Pantry">Pantry</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <Button onClick={addManualItem}>
                          Add Item
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm" onClick={resetShoppingList}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {shoppingItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No shopping list generated yet. Click "Generate from Meals" to create one.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group items by category */}
              {Object.entries(
                shoppingItems.reduce((acc, item, index) => {
                  if (!acc[item.category]) acc[item.category] = []
                  acc[item.category].push({ ...item, index })
                  return acc
                }, {} as Record<string, Array<ShoppingItem & { index: number }>>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <Checkbox
                          checked={item.isPurchased}
                          onCheckedChange={() => toggleItemPurchased(item.index)}
                          disabled={!permissions.canEditShoppingLists}
                        />
                        <div className="flex-1">
                          <span className={`${item.isPurchased ? 'line-through text-muted-foreground' : ''}`}>
                            {item.name}
                          </span>
                          {item.isManual && (
                            <Badge variant="outline" className="ml-2 text-xs">Manual</Badge>
                          )}
                        </div>
                        {isEditMode && permissions.canEditShoppingLists && (
                          <div className="flex items-center gap-2">
                            <Input
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.index, e.target.value)}
                              className="w-20"
                              placeholder="Qty"
                            />
                            <select
                              value={item.category}
                              onChange={(e) => updateItemCategory(item.index, e.target.value)}
                              className="w-32 p-1 border rounded"
                            >
                              <option value="Vegetables">Vegetables</option>
                              <option value="Fruits">Fruits</option>
                              <option value="Meat & Seafood">Meat & Seafood</option>
                              <option value="Dairy">Dairy</option>
                              <option value="Grains & Cereals">Grains & Cereals</option>
                              <option value="Spices & Condiments">Spices & Condiments</option>
                              <option value="Pantry">Pantry</option>
                              <option value="Other">Other</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {shoppingItems.length > 0 && (
        <div className="flex gap-4">
          {isEditMode ? (
            <>
              {permissions.canEditShoppingLists && (
                <Button 
                  onClick={saveShoppingList} 
                  disabled={isSaving || !hasUnsavedChanges}
                  className="flex-1"
                >
                  {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Shopping List
                </Button>
              )}
              {permissions.canEditShoppingLists && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </>
          ) : (
            <>
              {permissions.canEditShoppingLists && (
                <Button 
                  onClick={handleEditMode}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Shopping List
                </Button>
              )}
              {permissions.canDeleteShoppingLists && (
                <Button 
                  variant="destructive" 
                  onClick={() => setIsClearDialogOpen(true)}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear List
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-600">You have unsaved changes</span>
        </div>
      )}

      <ConfirmationDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        title="Clear Shopping List"
        description={`This will permanently delete the shopping list for the week of ${format(currentWeekStart, 'MMM d')}. This action cannot be undone.`}
        confirmText="Clear List"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={clearShoppingList}
      />
    </div>
  )
}