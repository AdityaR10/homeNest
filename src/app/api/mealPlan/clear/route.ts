// app/api/mealPlan/clear/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getUserWithFamily } from '@/lib/user-management'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getUserWithFamily(userId)
    if (!user || !user.family) {
      return NextResponse.json(
        { success: false, error: 'Family not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const weekStartDate = searchParams.get('weekStartDate')

    if (!weekStartDate) {
      return NextResponse.json(
        { success: false, error: 'Week start date is required' },
        { status: 400 }
      )
    }

    // Calculate week end date (6 days after start)
    const startDate = new Date(weekStartDate)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999) // End of day

    // Delete all meal plans for the specified week using correct field names
    const result = await db.mealPlan.deleteMany({
      where: {
        familyId: user.family.id,        // Use familyId instead of userId
        date: {                          // Use date instead of weekStartDate
          gte: startDate,
          lte: endDate
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${result.count} meal plans for the week`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('Error clearing meal plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear meal plan' },
      { status: 500 }
    )
  }
}