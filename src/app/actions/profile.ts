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
  phone?: string
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

    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role, // This will now work with enum
      },
      create: {
        clerkId: userId,
        email: email, // Use actual email from Clerk
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      },
    })

    revalidatePath('/dashboard/profile')
    return { success: true, user }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}