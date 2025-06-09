import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

// GET: Get family members
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        family: {
          include: {
            members: true,
            owner: true
          }
        }
      }
    })

    if (!user?.family) {
      return NextResponse.json(
        { success: false, error: 'No family found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      members: user.family.members,
      owner: user.family.owner
    })
  } catch (error) {
    console.error('Error fetching family members:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch family members' },
      { status: 500 }
    )
  }
}

// DELETE: Remove family member
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { memberId } = await request.json()
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // Get user and verify ownership
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { ownedFamily: true }
    })

    if (!user?.ownedFamily) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to remove members' },
        { status: 403 }
      )
    }

    // Check if trying to remove owner
    if (memberId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot remove family owner' },
        { status: 400 }
      )
    }

    // Remove member from family
    await db.user.update({
      where: { id: memberId },
      data: {
        familyId: null,
        invitedBy: null,
        joinedAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    })
  } catch (error) {
    console.error('Error removing family member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove family member' },
      { status: 500 }
    )
  }
} 