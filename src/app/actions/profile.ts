// src/app/actions/profile.ts - CORRECTED VERSION
'use server'

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db' // Use your existing db import
import { revalidatePath } from 'next/cache'
import { currentUser } from '@clerk/nextjs/server'

export async function updateProfile(data: {
  firstName: string
  lastName: string
  role: 'PARENT' | 'COOK' | 'DRIVER' | 'CHILD'
}) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Get additional user info from Clerk
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses[0]?.emailAddress || ''

    if (!email) {
      throw new Error('Email not found')
    }

    // Update our database
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
      create: {
        clerkId: userId,
        email: email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    })

    revalidatePath('/dashboard/profile')
    return { success: true, user }
  } catch (error) {
    console.error('Failed to update profile:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update profile' }
  }
}