// app/api/activities/route.ts - CORRECTED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getUserWithFamily } from '@/lib/user-management'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Use the simple Activity model
    const activities = await db.activity.findMany({
      orderBy: { date: 'asc' },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    return NextResponse.json({ success: true, activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, location } = body

    if (!title || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const activity = await db.activity.create({
      data: {
        title,
        description: description || '',
        date: new Date(date),
        location: location || '',
        status: 'pending',
        createdByClerkId: userId
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, date, location, status } = body

    if (!id || !title || !date) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const activity = await db.activity.update({
      where: { id },
      data: {
        title,
        description: description || '',
        date: new Date(date),
        location: location || '',
        status: status || 'pending'
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Activity ID required' }, { status: 400 })
    }

    await db.activity.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}