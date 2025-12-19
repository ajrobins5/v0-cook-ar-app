import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { RecipeCard } from "@/components/recipe-card"
import { recipes } from "@/lib/recipe-data"
import { Heart } from "lucide-react"

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: favorites } = await supabase.from("favorites").select("recipe_id").eq("user_id", user.id)

  const favoriteRecipeIds = new Set(favorites?.map((f) => f.recipe_id) || [])
  const favoriteRecipes = recipes.filter((recipe) => favoriteRecipeIds.has(recipe.id))

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-4xl font-bold">My Favorites</h1>
          </div>
          <p className="text-muted-foreground">Your saved recipes for quick access</p>
        </div>

        {favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} userId={user.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">Start adding recipes to your favorites to see them here</p>
          </div>
        )}
      </main>
    </div>
  )
}
