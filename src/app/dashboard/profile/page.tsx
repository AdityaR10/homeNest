import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { ProfileCard } from '@/components/profile/profile-card'
import { BackButton } from '@/components/ui/back-button'

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <BackButton href="/dashboard" />
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <ProfileCard />
          <ProfileForm />
        </div>
      </div>
    </main>
  )
} 