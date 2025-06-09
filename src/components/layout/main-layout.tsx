'use client'

import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Calendar,
  ChefHat,
  Home,
  ShoppingCart,
  Users,
  Car,
  Settings
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useUser()
  const pathname = usePathname()

  const getNavigationItems = () => {
    const role = user?.publicMetadata?.role as string

    const baseItems = [
      { href: "/dashboard", label: "Dashboard", icon: Home },
    ]

    switch (role) {
      case 'PARENT':
      case 'ADMIN':
        return [
          ...baseItems,
          { href: "/meals", label: "Meal Planner", icon: ChefHat },
          { href: "/shopping", label: "Shopping List", icon: ShoppingCart },
          { href: "/activities", label: "Activities", icon: Calendar },
          { href: "/admin", label: "Admin", icon: Settings },
        ]
      case 'COOK':
        return [
          ...baseItems,
          { href: "/cook", label: "Cook Dashboard", icon: ChefHat },
        ]
      case 'DRIVER':
        return [
          ...baseItems,
          { href: "/driver", label: "Driver Dashboard", icon: Car },
        ]
      case 'CHILD':
        return [
          ...baseItems,
          { href: "/activities", label: "My Activities", icon: Calendar },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
              <Home className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">HomeNest</span>
            </Link>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                >
                  <Link href={item.href} className="flex items-center space-x-2">
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>
            
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}