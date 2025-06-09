// src/lib/user-management.ts - FIXED VERSION
import { db } from '@/lib/db'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function createFamily(familyName?: string) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get user from database
  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Check if user already has a family
  if (user.familyId) {
    throw new Error('User already has a family')
  }

  // Create family with proper owner relation
  const family = await db.family.create({
    data: {
      name: familyName || `${user.firstName || 'User'}'s Family`,
      ownerId: user.id, // Use user's database ID, not clerkId
    }
  })

  // Update user's familyId
  await db.user.update({
    where: { clerkId: userId },
    data: { familyId: family.id }
  })

  return family
}

export async function getUserWithFamily(clerkId: string) {
  try {
    // First try to find user with family
    let user = await db.user.findUnique({
      where: { clerkId },
      include: {
        family: {
          include: {
            members: {
              select: {
                id: true,
                clerkId: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    })

    // If user doesn't exist, create them first
    if (!user) {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        throw new Error('Clerk user not found')
      }

      user = await db.user.create({
        data: {
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          role: 'PARENT'
        },
        include: {
          family: {
            include: {
              members: {
                select: {
                  id: true,
                  clerkId: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        }
      })
    }

    // If user exists but has no family, create one
    if (!user.family) {
      const family = await createFamily(`${user.firstName || 'User'}'s Family`)
      
      // Refetch user with family
      user = await db.user.findUnique({
        where: { clerkId },
        include: {
          family: {
            include: {
              members: {
                select: {
                  id: true,
                  clerkId: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        }
      })
    }

    return user
  } catch (error) {
    console.error('Error in getUserWithFamily:', error)
    throw error
  }
}

export async function addUserToFamily(userClerkId: string, familyId: string) {
  try {
    const user = await db.user.update({
      where: { clerkId: userClerkId },
      data: { familyId },
      include: {
        family: {
          include: {
            members: true
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error('Error adding user to family:', error)
    throw error
  }
}

export async function removeUserFromFamily(userClerkId: string) {
  try {
    const user = await db.user.update({
      where: { clerkId: userClerkId },
      data: { familyId: null }
    })

    return user
  } catch (error) {
    console.error('Error removing user from family:', error)
    throw error
  }
}

export async function deleteFamily(familyId: string, ownerClerkId: string) {
  try {
    // Verify the user is the owner
    const family = await db.family.findUnique({
      where: { id: familyId },
      include: { owner: true }
    })

    if (!family || family.owner.clerkId !== ownerClerkId) {
      throw new Error('Only family owner can delete family')
    }

    // Remove family ID from all members
    await db.user.updateMany({
      where: { familyId },
      data: { familyId: null }
    })

    // Delete the family
    await db.family.delete({
      where: { id: familyId }
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting family:', error)
    throw error
  }
}

// Helper function to check if user is family owner
export async function isUserFamilyOwner(userClerkId: string, familyId: string) {
  try {
    const family = await db.family.findUnique({
      where: { id: familyId },
      include: { owner: true }
    })

    return family?.owner.clerkId === userClerkId
  } catch (error) {
    console.error('Error checking family ownership:', error)
    return false
  }
}