'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home,
  Utensils,
  ShoppingCart,
  Calendar,
  Users,
  CheckSquare,
  User,
} from 'lucide-react'

const routes = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Meal Planner',
    icon: Utensils,
    href: '/dashboard/meals',
  },
  {
    label: 'Shopping List',
    icon: ShoppingCart,
    href: '/dashboard/shopping',
  },
  {
    label: 'Calendar',
    icon: Calendar,
    href: '/dashboard/calendar',
  },
  {
    label: "Family's Activities",
    icon: Users,
    href: '/dashboard/activities',
  },
  {
    label: 'Tasks',
    icon: CheckSquare,
    href: '/dashboard/tasks',
  },
  {
    label: 'Profile',
    icon: User,
    href: '/dashboard/profile',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setOpen } = useSidebar()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full py-4">
          <div className="space-y-1 px-3">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
} 