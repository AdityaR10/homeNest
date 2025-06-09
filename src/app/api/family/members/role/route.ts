import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { memberId, role } = body

    if (!memberId || !role) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return new NextResponse('Invalid role', { status: 400 })
    }

    // Get the user's family
    const userFamily = await db.family.findFirst({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: true
      }
    })

    if (!userFamily) {
      return new NextResponse('Family not found', { status: 404 })
    }

    // Check if the user is the owner
    const isOwner = userFamily.members.some(
      member => member.userId === userId && member.role === 'OWNER'
    )

    if (!isOwner) {
      return new NextResponse('Only family owners can update roles', { status: 403 })
    }

    // Check if the member exists in the family
    const member = userFamily.members.find(m => m.id === memberId)
    if (!member) {
      return new NextResponse('Member not found', { status: 404 })
    }

    // Don't allow changing owner's role
    if (member.role === 'OWNER') {
      return new NextResponse('Cannot change owner\'s role', { status: 403 })
    }

    // Update the member's role
    await db.familyMember.update({
      where: {
        id: memberId
      },
      data: {
        role
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[FAMILY_MEMBER_ROLE_UPDATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 