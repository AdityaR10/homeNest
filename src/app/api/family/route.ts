// src/app/api/family/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// GET: Get current user's family info (same as before)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with family - handle case where owner might be null
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            ownerId: true,
            inviteCode: true, // Include invite code
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                clerkId: true
              }
            }
          }
        }
      }
    })

    if (!user || !user.family) {
      return NextResponse.json({
        success: true,
        family: null,
        hasFamily: false,
        isOwner: false
      })
    }

    // Handle case where ownerId might be null (legacy data)
    let owner = null
    let isOwner = false

    if (user.family.ownerId) {
      try {
        owner = await db.user.findUnique({
          where: { id: user.family.ownerId },
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            lastName: true
          }
        })
        isOwner = owner?.clerkId === userId
      } catch (error) {
        console.warn('Could not fetch family owner:', error)
      }
    } else {
      isOwner = true
    }

    return NextResponse.json({
      success: true,
      family: {
        id: user.family.id,
        name: user.family.name,
        createdAt: user.family.createdAt,
        inviteCode: user.family.inviteCode, // Include invite code in response
        owner: owner ? {
          name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim(),
          isMe: isOwner
        } : {
          name: 'No owner set',
          isMe: isOwner
        },
        members: user.family.members.map(member => ({
          id: member.id,
          name: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
          email: member.email,
          role: member.role,
          isOwner: owner ? member.clerkId === owner.clerkId : member.clerkId === userId
        }))
      },
      hasFamily: true,
      isOwner
    })
  } catch (error) {
    console.error('[FAMILY_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Internal Error' },
      { status: 500 }
    )
  }
}

// POST: Create new family (FIXED - Handle inviteCode properly)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Family name is required' },
        { status: 400 }
      )
    }

    // Get user to check if they already have a family
    const existingUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, familyId: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (existingUser.familyId) {
      return NextResponse.json(
        { success: false, error: 'User already has a family' },
        { status: 400 }
      )
    }

    // Create new family WITHOUT inviteCode initially
    const family = await db.family.create({
      data: {
        name,
        ownerId: existingUser.id,
        // Don't set inviteCode here - it will be null by default
        // We'll generate it later when needed
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Update user's familyId
    await db.user.update({
      where: { clerkId: userId },
      data: { familyId: family.id }
    })

    return NextResponse.json({
      success: true,
      family: {
        id: family.id,
        name: family.name,
        owner: family.owner
      }
    })
  } catch (error) {
    console.error('[FAMILY_POST]', error)
    
    // Handle specific constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A family with this configuration already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal Error' },
      { status: 500 }
    )
  }
}

// PUT and DELETE remain the same...
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Family name is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { family: true }
    })

    if (!user || !user.family) {
      return NextResponse.json(
        { success: false, error: 'Family not found' },
        { status: 404 }
      )
    }

    const isOwner = !user.family.ownerId || user.family.ownerId === user.id

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only family owner can update family details' },
        { status: 403 }
      )
    }

    const updatedFamily = await db.family.update({
      where: { id: user.family.id },
      data: { 
        name,
        ...(user.family.ownerId ? {} : { ownerId: user.id })
      }
    })

    return NextResponse.json({
      success: true,
      family: updatedFamily
    })
  } catch (error) {
    console.error('[FAMILY_PUT]', error)
    return NextResponse.json(
      { success: false, error: 'Internal Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { family: true }
    })

    if (!user || !user.family) {
      return NextResponse.json(
        { success: false, error: 'Family not found' },
        { status: 404 }
      )
    }

    const isOwner = !user.family.ownerId || user.family.ownerId === user.id

    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Only family owner can delete family' },
        { status: 403 }
      )
    }

    await db.user.updateMany({
      where: { familyId: user.family.id },
      data: { familyId: null }
    })

    await db.family.delete({
      where: { id: user.family.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Family deleted successfully'
    })
  } catch (error) {
    console.error('[FAMILY_DELETE]', error)
    return NextResponse.json(
      { success: false, error: 'Internal Error' },
      { status: 500 }
    )
  }
}