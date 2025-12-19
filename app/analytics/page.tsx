import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AnalyticsContent } from "@/components/analytics-content"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user analytics
  const { data: analytics } = await supabase
    .from("user_analytics")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch completed recipes count
  const { data: progress } = await supabase
    .from("recipe_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("completed", true)

  // Fetch favorites count
  const { data: favorites } = await supabase.from("favorites").select("id").eq("user_id", user.id)

  // Fetch reviews count
  const { data: reviews } = await supabase.from("recipe_reviews").select("id").eq("user_id", user.id)

  return (
    <div className="min-h-screen">
      <Header />
      <AnalyticsContent
        analytics={analytics || []}
        completedCount={progress?.length || 0}
        favoritesCount={favorites?.length || 0}
        reviewsCount={reviews?.length || 0}
      />
    </div>
  )
}
