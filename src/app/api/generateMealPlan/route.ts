import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { generateMealPlan } from '@/lib/gemini'
import { getUserWithFamily } from '@/lib/user-management'
import { MealType } from '@prisma/client'

interface GeneratedMeal {
  title: string
  description: string
  ingredients: string[]
  instructions: string
  cuisine: string
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserWithFamily(userId)
    if (!user?.family?.id) {
      return NextResponse.json({ error: 'User not part of a family' }, { status: 400 })
    }

    const familyId = user.family.id

    const body = await req.json()
    const { 
      cuisine, 
      dietaryRestrictions, 
      numberOfPeople, 
      numberOfDays,
      availableIngredients,
      excludeIngredients 
    } = body

    if (!cuisine || !numberOfPeople || !numberOfDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate meals using Gemini
    const meals = await generateMealPlan({
      cuisine: cuisine,
      dietaryRestrictions: dietaryRestrictions || [],
      numberOfPeople,
      numberOfDays,
      availableIngredients: availableIngredients || [],
      excludeIngredients: excludeIngredients || []
    }) as GeneratedMeal[]

    if (!meals || meals.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate meals' },
        { status: 500 }
      )
    }

    // Save generated meals to database
    const savedMeals = await Promise.all(
      meals.map(async (meal) => {
        return db.mealPlan.create({
          data: {
            title: meal.title,
            description: meal.description,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            cuisine: meal.cuisine,
            mealType: meal.mealType as MealType,
            date: new Date(),
            isAiGenerated: true,
            familyId,
            createdByClerkId: userId
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      meals: savedMeals
    })
  } catch (error) {
    console.error('[GENERATE_MEAL_PLAN] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function categorizeIngredient(ingredient: string): string {
  const categories = {
    'Vegetables': ['tomato', 'onion', 'garlic', 'carrot', 'potato', 'bell pepper', 'spinach', 'lettuce', 'cucumber', 'cabbage'],
    'Meat': ['chicken', 'beef', 'pork', 'fish', 'lamb', 'turkey', 'salmon', 'tuna'],
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'],
    'Grains': ['rice', 'bread', 'pasta', 'flour', 'oats', 'quinoa', 'wheat'],
    'Spices': ['salt', 'pepper', 'cumin', 'turmeric', 'cinnamon', 'oregano', 'basil'],
    'Pantry': ['oil', 'vinegar', 'sugar', 'honey', 'soy sauce', 'tomato sauce']
  }

  for (const [category, items] of Object.entries(categories)) {
    if (items.some(item => ingredient.toLowerCase().includes(item.toLowerCase()))) {
      return category
    }
  }

  return 'Other'
}