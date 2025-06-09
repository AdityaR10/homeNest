import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the user's family
    const userFamily = await db.family.findFirst({
      where: {
        members: {
          some: {
            userId,
            role: 'OWNER'
          }
        }
      }
    })

    if (!userFamily) {
      return new NextResponse('Family not found or user is not the owner', { status: 404 })
    }

    // Generate new invite code
    const inviteCode = nanoid(8)
    const inviteExpiry = new Date()
    inviteExpiry.setDate(inviteExpiry.getDate() + 7) // Expires in 7 days

    // Update family with new invite code
    const family = await db.family.update({
      where: {
        id: userFamily.id
      },
      data: {
        inviteCode,
        inviteExpiry
      }
    })

    return NextResponse.json({
      inviteCode: family.inviteCode,
      inviteExpiry: family.inviteExpiry
    })
  } catch (error) {
    console.error('[FAMILY_INVITE_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the user's family
    const userFamily = await db.family.findFirst({
      where: {
        members: {
          some: {
            userId,
            role: 'OWNER'
          }
        }
      }
    })

    if (!userFamily) {
      return new NextResponse('Family not found or user is not the owner', { status: 404 })
    }

    // Generate new invite code
    const inviteCode = nanoid(8)
    const inviteExpiry = new Date()
    inviteExpiry.setDate(inviteExpiry.getDate() + 7) // Expires in 7 days

    // Update family with new invite code
    const family = await db.family.update({
      where: {
        id: userFamily.id
      },
      data: {
        inviteCode,
        inviteExpiry
      }
    })

    return NextResponse.json({
      inviteCode: family.inviteCode,
      inviteExpiry: family.inviteExpiry
    })
  } catch (error) {
    console.error('[FAMILY_INVITE_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get the user's family
    const userFamily = await db.family.findFirst({
      where: {
        members: {
          some: {
            userId,
            role: 'OWNER'
          }
        }
      }
    })

    if (!userFamily) {
      return new NextResponse('Family not found or user is not the owner', { status: 404 })
    }

    // Remove invite code
    const family = await db.family.update({
      where: {
        id: userFamily.id
      },
      data: {
        inviteCode: null,
        inviteExpiry: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[FAMILY_INVITE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 