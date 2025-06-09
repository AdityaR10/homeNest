import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, date, location, status } = body

    // Find the activity first to check ownership
    const existingActivity = await db.activity.findUnique({
      where: { id: params.id }
    })

    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    if (existingActivity.createdByClerkId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update the activity
    const activity = await db.activity.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(location !== undefined && { location }),
        ...(status && { status })
      }
    })

    return NextResponse.json({
      success: true,
      activity
    })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the activity first to check ownership
    const existingActivity = await db.activity.findUnique({
      where: { id: params.id }
    })

    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      )
    }

    if (existingActivity.createdByClerkId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete the activity
    await db.activity.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
} 