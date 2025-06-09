import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { type ComponentType, createElement } from 'react'

export function withPermission(permission: string, Component: ComponentType<any>) {
  return async function ProtectedComponent(props: any) {
    const { userId } = await auth()
    if (!userId) {
      redirect('/sign-in')
    }
    // TODO: Add actual permission check logic here
    return createElement(Component, props)
  }
} 