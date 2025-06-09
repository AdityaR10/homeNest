import { UserRole, MealType, ActivityStatus } from '@prisma/client'

export interface User {
  id: string
  clerkId: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  familyId?: string
}

export interface MealPlan {
  id: string
  title: string
  description?: string
  mealType: MealType
  date: Date
  ingredients: string[]
  instructions?: string
  calories?: number
  cuisine?: string
  isAiGenerated: boolean
}

export interface ShoppingListItem {
  id: string
  name: string
  quantity?: string
  category?: string
  isPurchased: boolean
}

export interface ChildActivity {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
  instructor?: string
  isRecurring: boolean
  status: ActivityStatus
}

export interface DashboardStats {
  upcomingMeals: number
  pendingShoppingItems: number
  todayActivities: number
  weeklyMeals: number
}