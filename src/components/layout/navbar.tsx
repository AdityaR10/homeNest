'use client'

import { UserButton } from '@clerk/nextjs'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import Link from 'next/link'

export function Navbar() {
  const { toggle } = useSidebar()

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggle}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="text-xl font-bold">homeNest</Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  )
} 