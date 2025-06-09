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
    const week = searchParams.get('week')

    const user = await getUserWithFamily(userId)
    if (!user?.family) {
      return NextResponse.json({ error: 'User or family not found' }, { status: 404 })
    }

    let whereClause: any = {
      familyId: user.family.id
    }

    if (week) {
      const weekStartDate = new Date(week)
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 7)
      
      whereClause.date = {
        gte: weekStartDate,
        lt: weekEndDate
      }
    }

    const shoppingList = await db.shoppingList.findFirst({
      where: whereClause,
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      shoppingList
    })

  } catch (error) {
    console.error('[GET_SHOPPING_LIST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shopping list' },
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
    const { weekStart, items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ 
        error: 'Items array is required' 
      }, { status: 400 })
    }

    const user = await getUserWithFamily(userId)
    if (!user?.family) {
      return NextResponse.json({ error: 'User or family not found' }, { status: 404 })
    }

    // Check if shopping list already exists for this week
    const weekStartDate = new Date(weekStart)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekStartDate.getDate() + 7)

    const existingList = await db.shoppingList.findFirst({
      where: {
        familyId: user.family.id,
        date: {
          gte: weekStartDate,
          lt: weekEndDate
        }
      }
    })

    if (existingList) {
      // Update existing shopping list
      await db.shoppingListItem.deleteMany({
        where: { shoppingListId: existingList.id }
      })

      await db.shoppingListItem.createMany({
        data: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity || '1',
          category: item.category || 'Other',
          isPurchased: item.isPurchased || false,
          shoppingListId: existingList.id
        }))
      })

      const updatedList = await db.shoppingList.findUnique({
        where: { id: existingList.id },
        include: { items: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Shopping list updated successfully',
        shoppingList: updatedList
      })
    } else {
      // Create new shopping list
      const shoppingList = await db.shoppingList.create({
        data: {
          title: `Shopping List - ${new Date(weekStart).toLocaleDateString()}`,
          date: weekStartDate,
          familyId: user.family.id,
          items: {
            create: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity || '1',
              category: item.category || 'Other',
              isPurchased: item.isPurchased || false
            }))
          }
        },
        include: {
          items: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Shopping list created successfully',
        shoppingList
      })
    }

  } catch (error) {
    console.error('[SAVE_SHOPPING_LIST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save shopping list' },
      { status: 500 }
    )
  }
} 