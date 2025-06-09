'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  ChefHat,
  ShoppingCart,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  upcomingMeals: number
  pendingShoppingItems: number
  todayActivities: number
  pendingTasks: number
}

interface MobileDashboardProps {
  stats: DashboardStats
  userRole: string
}

export function MobileDashboard({ stats, userRole }: MobileDashboardProps) {
  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold md:text-3xl">Good Morning!</h1>
        <p className="text-muted-foreground">Here's what's happening today</p>
      </div>

      {/* Quick Stats Grid - Mobile First */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-3">
          <div className="flex flex-col items-center space-y-2">
            <ChefHat className="h-6 w-6 text-orange-500" />
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.upcomingMeals}</p>
              <p className="text-xs text-muted-foreground">Today's Meals</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex flex-col items-center space-y-2">
            <ShoppingCart className="h-6 w-6 text-blue-500" />
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.pendingShoppingItems}</p>
              <p className="text-xs text-muted-foreground">Shopping Items</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex flex-col items-center space-y-2">
            <Calendar className="h-6 w-6 text-green-500" />
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.todayActivities}</p>
              <p className="text-xs text-muted-foreground">Activities</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex flex-col items-center space-y-2">
            <Clock className="h-6 w-6 text-purple-500" />
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.pendingTasks}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button asChild className="h-12 justify-start">
              <Link href="/dashboard/meals/new" className="flex items-center space-x-3">
                <Plus className="h-5 w-5" />
                <span>Plan Meals</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-12 justify-start">
              <Link href="/dashboard/shopping" className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5" />
                <span>Shopping List</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule - Mobile Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Today's Schedule
            <Badge variant="secondary">{stats.todayActivities} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Sample schedule items - replace with real data */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
              <div className="flex-shrink-0">
                <ChefHat className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Breakfast</p>
                <p className="text-sm text-muted-foreground">8:00 AM</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Soccer Practice</p>
                <p className="text-sm text-muted-foreground">4:00 PM - 5:30 PM</p>
              </div>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/activities">View All Activities</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm">Cook confirmed lunch preparation</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-sm">Driver picked up from school</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}