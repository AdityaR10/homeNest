import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserWithFamily } from '@/lib/user-management'
import { generateShoppingListWithGemini } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { weekStart, mealPlans } = body

    if (!mealPlans || mealPlans.length === 0) {
      return NextResponse.json({ 
        error: 'No meal plans provided' 
      }, { status: 400 })
    }

    // Get user with family for permissions
    const user = await getUserWithFamily(userId)
    if (!user?.family) {
      return NextResponse.json({ error: 'User or family not found' }, { status: 404 })
    }

    // Generate shopping list using Gemini
    const shoppingList = await generateShoppingListWithGemini({
      mealPlans,
      weekStart,
      familySize: 3 // You can make this dynamic based on family members
    })

    return NextResponse.json({
      success: true,
      shoppingList
    })

  } catch (error) {
    console.error('[GENERATE_SHOPPING_LIST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate shopping list' },
      { status: 500 }
    )
  }
} 