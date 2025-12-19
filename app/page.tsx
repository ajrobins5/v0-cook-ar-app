import { RecipeGrid } from "@/components/recipe-grid"
import { Header } from "@/components/header"
import { PersonalizedSection } from "@/components/personalized-section"
import { createClient } from "@/lib/supabase/server"

interface HomePageProps {
  searchParams: Promise<{
    search?: string
    difficulty?: string
    time?: string
    category?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  let favorites: string[] = []
  let completedRecipes: string[] = []
  let viewedRecipes: string[] = []

  if (user) {
    // Fetch user profile
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = profileData

    // Fetch favorites
    const { data: favoritesData } = await supabase.from("favorites").select("recipe_id").eq("user_id", user.id)
    favorites = favoritesData?.map((f) => f.recipe_id) || []

    // Fetch completed recipes
    const { data: progressData } = await supabase
      .from("recipe_progress")
      .select("recipe_id")
      .eq("user_id", user.id)
      .eq("completed", true)
    completedRecipes = progressData?.map((p) => p.recipe_id) || []

    // Fetch viewed recipes (from analytics)
    const { data: analyticsData } = await supabase
      .from("user_analytics")
      .select("recipe_id")
      .eq("user_id", user.id)
      .eq("action", "view")
      .order("created_at", { ascending: false })
      .limit(10)
    viewedRecipes = analyticsData?.map((a) => a.recipe_id) || []
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">
            Cook with <span className="text-primary">Confidence</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            Master any recipe with AR-guided step-by-step instructions. See ingredients, measurements, and techniques
            overlaid in your kitchen.
          </p>
        </section>

        {user && profile && (
          <PersonalizedSection
            profile={profile}
            favorites={favorites}
            completedRecipes={completedRecipes}
            viewedRecipes={viewedRecipes}
            userId={user.id}
          />
        )}

        <RecipeGrid searchParams={params} />
      </main>
    </div>
  )
}
