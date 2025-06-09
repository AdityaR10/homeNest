'use client'

import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" 
import { 
  Calendar,
  ChefHat,
  Home,
  ShoppingCart,
  Users,
  Car,
  Settings,
  Menu,
  Bell
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface MobileLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { user } = useUser()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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
          { href: "/dashboard/meals", label: "Meal Planner", icon: ChefHat },
          { href: "/dashboard/shopping", label: "Shopping", icon: ShoppingCart },
          { href: "/dashboard/activities", label: "Activities", icon: Calendar },
          { href: "/dashboard/admin", label: "Settings", icon: Settings },
        ]
      case 'COOK':
        return [
          ...baseItems,
          { href: "/dashboard/cook", label: "Kitchen", icon: ChefHat },
        ]
      case 'DRIVER':
        return [
          ...baseItems,
          { href: "/dashboard/driver", label: "Transport", icon: Car },
        ]
      case 'CHILD':
        return [
          ...baseItems,
          { href: "/dashboard/activities", label: "My Schedule", icon: Calendar },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4 py-4">
                <div className="px-2">
                  <h2 className="text-lg font-semibold">HomeNest</h2>
                  <p className="text-sm text-muted-foreground">
                    {user?.firstName} 
                    {/* ({user?.publicMetadata?.role}) */}
                  </p>
                </div>
                <nav className="flex flex-col space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname === item.href ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href={item.href} className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </Button>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Home className="h-6 w-6" />
              <span className="font-bold">HomeNest</span>
            </Link>
            {navigationItems.slice(1).map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
              >
                <Link href={item.href} className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.slice(0, 4).map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "default" : "ghost"}
              size="sm"
              className="flex flex-col space-y-1 h-12"
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label.split(' ')[0]}</span>
              </Link>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}