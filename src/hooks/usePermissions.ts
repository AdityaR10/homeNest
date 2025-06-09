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

// All family members have full access to view and edit resources
const getDefaultPermissions = (): UserPermissions => ({
  // Meal Plans
  canCreateMealPlans: true,
  canEditMealPlans: true,
  canDeleteMealPlans: true,
  canViewMealPlans: true,
  
  // Activities
  canCreateActivities: true,
  canEditActivities: true,
  canDeleteActivities: true,
  canViewActivities: true,
  
  // Shopping Lists
  canCreateShoppingLists: true,
  canEditShoppingLists: true,
  canDeleteShoppingLists: true,
  canViewShoppingLists: true,
  
  // Family Management (restricted to ADMIN role)
  canManageFamily: false,
  canInviteMembers: false,
  canChangeUserRoles: false,
  
  // AI Features
  canGenerateAIMealPlans: true,
})

export const usePermissions = () => {
  const { user, isLoaded } = useUser()
  const [userRole, setUserRole] = useState<string>('PARENT')
  const [isLoading, setIsLoading] = useState(true)
  const [permissions, setPermissions] = useState<UserPermissions>(getDefaultPermissions())

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/user')
          const data = await response.json()
          if (data.success && data.user) {
            setUserRole(data.user.role)
            
            // Update permissions based on role
            const newPermissions = getDefaultPermissions()
            if (data.user.role === 'ADMIN') {
              newPermissions.canManageFamily = true
              newPermissions.canInviteMembers = true
              newPermissions.canChangeUserRoles = true
            }
            setPermissions(newPermissions)
          }
        } catch (error) {
          console.error('Error fetching user role:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserRole()
  }, [isLoaded, user])

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