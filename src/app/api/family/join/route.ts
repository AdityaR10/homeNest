import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { inviteCode } = body

    if (!inviteCode) {
      return new NextResponse('Invite code is required', { status: 400 })
    }

    // Check if user already has a family
    const existingFamily = await db.family.findFirst({
      where: {
        members: {
          some: {
            clerkId: userId
          }
        }
      }
    })

    if (existingFamily) {
      return new NextResponse('User already belongs to a family', { status: 400 })
    }

    // Find family with valid invite code
    const family = await db.family.findFirst({
      where: {
        inviteCode,
        inviteExpiry: {
          gt: new Date()
        }
      },
      include: {
        members: true
      }
    })

    if (!family) {
      return new NextResponse('Invalid or expired invite code', { status: 400 })
    }

    // Check if family has reached max members
    if (family.members.length >= family.maxMembers) {
      return new NextResponse('Family has reached maximum member limit', { status: 400 })
    }

    // Get the user
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Add user to family
    await db.user.update({
      where: { clerkId: userId },
      data: {
        familyId: family.id,
        role: UserRole.PARENT // Default role for new members
      }
    })

    return NextResponse.json({
      message: 'Successfully joined family',
      family: {
        id: family.id,
        name: family.name
      }
    })
  } catch (error) {
    console.error('[FAMILY_JOIN_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's family
    const userFamily = await db.family.findFirst({
      where: {
        members: {
          some: {
            clerkId:userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        joinRequests: {
          where: {
            status: 'PENDING'
          },
          include: {
            user: true
          }
        }
      }
    })

    if (!userFamily) {
      return new NextResponse('Family not found or user is not the owner', { status: 404 })
    }

    return NextResponse.json({
      joinRequests: userFamily.joinRequests
    })
  } catch (error) {
    console.error('[FAMILY_JOIN_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { requestId, action } = body

    if (!requestId || !action) {
      return new NextResponse('Request ID and action are required', { status: 400 })
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return new NextResponse('Invalid action', { status: 400 })
    }

    // Get user's family
    const userFamily = await db.family.findFirst({
      where: {
        members: {
          some: {
            clerkId:userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: true,
        joinRequests: {
          where: {
            id: requestId,
            status: 'PENDING'
          }
        }
      }
    })

    if (!userFamily) {
      return new NextResponse('Family not found or user is not the owner', { status: 404 })
    }

    const joinRequest = userFamily.joinRequests[0]
    if (!joinRequest) {
      return new NextResponse('Join request not found', { status: 404 })
    }

    if (action === 'APPROVE') {
      // Check if family has reached max members
      if (userFamily.members.length >= userFamily.maxMembers) {
        return new NextResponse('Family has reached maximum member limit', { status: 400 })
      }

      // Add user to family
      await db.familyMember.create({
        data: {
          familyId: userFamily.id,
          userId: joinRequest.userId,
          role: 'MEMBER'
        }
      })
    }

    // Update join request status
    await db.familyJoinRequest.update({
      where: {
        id: requestId
      },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date()
      }
    })

    return NextResponse.json({
      message: `Join request ${action.toLowerCase()}d successfully`
    })
  } catch (error) {
    console.error('[FAMILY_JOIN_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 