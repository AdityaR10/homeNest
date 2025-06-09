'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

interface UserPermissions {
  canCreateMealPlans: boolean
  canEditMealPlans: boolean
  canDeleteMealPlans: boolean
  canViewMealPlans: boolean
  canCreateActivities: boolean
  canEditActivities: boolean
  canDeleteActivities: boolean
  canViewActivities: boolean
  canCreateShoppingLists: boolean
  canEditShoppingLists: boolean
  canDeleteShoppingLists: boolean
  canViewShoppingLists: boolean
  canManageFamily: boolean
  canInviteMembers: boolean
  canChangeUserRoles: boolean
  canGenerateAIMealPlans: boolean
}

// Simplified permissions - for now, all authenticated users have full permissions
// You can enhance this later with role-based permissions
const getDefaultPermissions = (): UserPermissions => ({
  canCreateMealPlans: true,
  canEditMealPlans: true,
  canDeleteMealPlans: true,
  canViewMealPlans: true,
  canCreateActivities: true,
  canEditActivities: true,
  canDeleteActivities: true,
  canViewActivities: true,
  canCreateShoppingLists: true,
  canEditShoppingLists: true,
  canDeleteShoppingLists: true,
  canViewShoppingLists: true,
  canManageFamily: true,
  canInviteMembers: true,
  canChangeUserRoles: false, // Keep this false for safety
  canGenerateAIMealPlans: true,
})

export const usePermissions = () => {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<string>('PARENT')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      // For now, set everyone as PARENT role
      // You can fetch actual role from your database later
      setUserRole('PARENT')
      setIsLoading(false)
    }
  }, [isLoaded])

  const permissions = getDefaultPermissions()

  return {
    permissions,
    userRole,
    isLoading: isLoading || !isLoaded,
    // Helper functions
    canEdit: (resourceType: 'mealPlan' | 'activity' | 'shoppingList') => {
      switch (resourceType) {
        case 'mealPlan': return permissions.canEditMealPlans
        case 'activity': return permissions.canEditActivities
        case 'shoppingList': return permissions.canEditShoppingLists
        default: return false
      }
    },
    canCreate: (resourceType: 'mealPlan' | 'activity' | 'shoppingList') => {
      switch (resourceType) {
        case 'mealPlan': return permissions.canCreateMealPlans
        case 'activity': return permissions.canCreateActivities
        case 'shoppingList': return permissions.canCreateShoppingLists
        default: return false
      }
    },
    canDelete: (resourceType: 'mealPlan' | 'activity' | 'shoppingList') => {
      switch (resourceType) {
        case 'mealPlan': return permissions.canDeleteMealPlans
        case 'activity': return permissions.canDeleteActivities
        case 'shoppingList': return permissions.canDeleteShoppingLists
        default: return false
      }
    }
  }
} 