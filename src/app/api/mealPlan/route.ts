import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getUserWithFamily } from '@/lib/user-management'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')
    const date = searchParams.get('date')

    // Get user with family
    const user = await getUserWithFamily(userId)
    if (!user?.family) {
      return NextResponse.json({ error: 'User not part of a family' }, { status: 404 })
    }

    let whereClause: any = {
      familyId: user.family.id
    }

    if (weekStart) {
      const weekStartDate = new Date(weekStart)
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 7)
      
      whereClause.date = {
        gte: weekStartDate,
        lt: weekEndDate
      }
    } else if (date) {
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    const mealPlans = await db.mealPlan.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        },
        cookMealLogs: {
          include: {
            cook: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Convert to the expected format for the frontend
    const weekStartDate = weekStart ? new Date(weekStart) : null
    const weekEndDate = weekStartDate ? new Date(weekStartDate) : null
    if (weekEndDate && weekStartDate) {
      weekEndDate.setDate(weekStartDate.getDate() + 7)
    }

    const structuredMealPlan: Record<string, Record<string, any>> = {}
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    const meals = ['BREAKFAST', 'LUNCH', 'DINNER']

    // Initialize the structure
    days.forEach(day => {
      structuredMealPlan[day] = {}
      meals.forEach(meal => {
        structuredMealPlan[day][meal] = null
      })
    })

    // Fill in the meals
    mealPlans.forEach(meal => {
      const mealDate = new Date(meal.date)
      const dayIndex = mealDate.getDay()
      const day = days[dayIndex === 0 ? 6 : dayIndex - 1] // Convert Sunday (0) to last day
      const mealType = meal.mealType

      if (structuredMealPlan[day] && structuredMealPlan[day][mealType] === null) {
        structuredMealPlan[day][mealType] = meal
      }
    })

    return NextResponse.json({
      success: true,
      mealPlan: structuredMealPlan
    })

  } catch (error) {
    console.error('[GET_MEAL_PLAN] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal plan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[CREATE_MEAL_PLAN] Request body:', JSON.stringify(body, null, 2))

    const { 
      title, 
      description, 
      mealType, 
      date, 
      ingredients, 
      instructions, 
      calories, 
      cuisine,
      weekStart,
      mealPlan: weeklyMealsData  // Renamed to avoid table name conflict
    } = body

    // Get user with family
    const user = await getUserWithFamily(userId)
    if (!user?.family) {
      return NextResponse.json({ error: 'User not part of a family' }, { status: 404 })
    }

    // Handle bulk meal plan creation (from weekly planner)
    if (weekStart && weeklyMealsData) {
      console.log('[CREATE_MEAL_PLAN] Processing weekly meal plan')
      
      const savedMeals = []
      const errors = []
      const startDate = new Date(weekStart)
      
      const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
      const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER']
      
      // First, clear existing meals for this week to avoid duplicates
      try {
        const weekEndDate = new Date(startDate)
        weekEndDate.setDate(startDate.getDate() + 7)
        
        await db.mealPlan.deleteMany({
          where: {
            familyId: user.family.id,
            date: {
              gte: startDate,
              lt: weekEndDate
            }
          }
        })
        console.log('[CREATE_MEAL_PLAN] Cleared existing meals for the week')
      } catch (clearError) {
        console.error('[CREATE_MEAL_PLAN] Error clearing existing meals:', clearError)
      }
      
      // Process each day and meal type
      for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
        const day = days[dayIndex]
        const mealDate = new Date(startDate)
        mealDate.setDate(startDate.getDate() + dayIndex)
        
        for (const mealType of mealTypes) {
          const mealData = weeklyMealsData[day]?.[mealType]
          
          if (mealData) {
            try {
              const savedMeal = await db.mealPlan.create({
                data: {
                  ...mealData,
                  date: mealDate,
                  familyId: user.family.id,
                  createdByClerkId: userId
                },
                include: {
                  createdBy: {
                    select: {
                      firstName: true,
                      lastName: true,
                      role: true
                    }
                  }
                }
              })
              savedMeals.push(savedMeal)
              console.log(`[CREATE_MEAL_PLAN] Saved meal: ${day} ${mealType} - ${mealData.title}`)
            } catch (mealError) {
              console.error(`[CREATE_MEAL_PLAN] Error saving meal for ${day} ${mealType}:`, mealError)
              errors.push(`Failed to save ${day} ${mealType}: ${mealError instanceof Error ? mealError.message : 'Unknown error'}`)
            }
          }
        }
      }
      
      const response: any = {
        success: true,
        message: `Saved ${savedMeals.length} meals`,
        meals: savedMeals
      }
      
      if (errors.length > 0) {
        response.warnings = errors
      }
      
      return NextResponse.json(response)
    }

    // Handle single meal creation
    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!mealType) {
      return NextResponse.json(
        { error: 'Meal type is required' },
        { status: 400 }
      )
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    // Validate date
    const mealDate = new Date(date)
    if (isNaN(mealDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date provided' },
        { status: 400 }
      )
    }

    // Validate mealType
    const validMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
    const normalizedMealType = mealType.toUpperCase()
    if (!validMealTypes.includes(normalizedMealType)) {
      return NextResponse.json(
        { error: `Invalid meal type. Must be one of: ${validMealTypes.join(', ')}` },
        { status: 400 }
      )
    }

    console.log('[CREATE_MEAL_PLAN] Creating single meal plan with validated data')

    // Use different variable name to avoid conflict with table name
    const newMealPlan = await db.mealPlan.create({
      data: {
        title: title.trim(),
        description: description || '',
        mealType: normalizedMealType as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
        date: mealDate,
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        instructions: instructions || '',
        calories: calories ? parseInt(calories.toString()) : null,
        cuisine: cuisine || '',
        isAiGenerated: false,
        familyId: user.family.id,
        createdByClerkId: userId
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      mealPlan: newMealPlan
    })

  } catch (error) {
    console.error('[CREATE_MEAL_PLAN] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with family
    const user = await getUserWithFamily(userId)
    if (!user?.family) {
      return NextResponse.json({ error: 'User not part of a family' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')

    if (!weekStart) {
      return NextResponse.json({ error: 'Week start date is required' }, { status: 400 })
    }

    const startDate = new Date(weekStart)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    // Delete all meals for the specified week
    await db.mealPlan.deleteMany({
      where: {
        familyId: user.family.id,
        date: {
          gte: startDate,
          lt: endDate
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Meal plan cleared successfully'
    })

  } catch (error) {
    console.error('[DELETE_MEAL_PLAN] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}