'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  ShoppingCart,
  Users,
  Utensils,
  Plus,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export function QuickAccess() {
  const quickLinks = [
    {
      name: 'Calendar',
      icon: Calendar,
      href: '/dashboard/calendar',
    },
    {
      name: 'Shopping',
      icon: ShoppingCart,
      href: '/dashboard/shopping',
    },
    {
      name: 'Family',
      icon: Users,
      href: '/dashboard/family',
    },
    {
      name: 'Meals',
      icon: Utensils,
      href: '/dashboard/meals',
    },
    {
      name: 'Add New',
      icon: Plus,
      href: '/dashboard/meals/new',
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Access</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <Button
                variant="outline"
                className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
              >
                <link.icon className="h-6 w-6" />
                <span className="text-sm">{link.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 