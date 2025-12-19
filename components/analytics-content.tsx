"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, ChefHat, Heart, Star, Clock } from "lucide-react"

interface AnalyticsContentProps {
  analytics: Array<{
    id: string
    action: string
    duration_seconds: number | null
    created_at: string
  }>
  completedCount: number
  favoritesCount: number
  reviewsCount: number
}

export function AnalyticsContent({ analytics, completedCount, favoritesCount, reviewsCount }: AnalyticsContentProps) {
  const totalViews = analytics.filter((a) => a.action === "view").length
  const totalCookTime = analytics
    .filter((a) => a.duration_seconds)
    .reduce((sum, a) => sum + (a.duration_seconds || 0), 0)

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const recentActivity = analytics.slice(0, 10)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">My Analytics</h1>
        </div>
        <p className="text-muted-foreground">Track your cooking journey and achievements</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{completedCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Recipes Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{formatDuration(totalCookTime)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Cook Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{favoritesCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Favorite Recipes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{reviewsCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Reviews Written</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.action === "complete"
                          ? "bg-green-500"
                          : activity.action === "start"
                            ? "bg-blue-500"
                            : activity.action === "share"
                              ? "bg-purple-500"
                              : "bg-gray-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium capitalize">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {activity.duration_seconds && (
                    <span className="text-sm text-muted-foreground">{formatDuration(activity.duration_seconds)}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No activity yet. Start cooking to see your stats!</p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
