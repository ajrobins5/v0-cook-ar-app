import { RecipeCard } from "@/components/recipe-card"
import { recipes } from "@/lib/recipe-data"
import { createClient } from "@/lib/supabase/server"
import { RecipeFilters } from "@/components/recipe-filters"

interface RecipeGridProps {
  searchParams?: {
    search?: string
    difficulty?: string
    time?: string
    category?: string
  }
}

export async function RecipeGrid({ searchParams }: RecipeGridProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let filteredRecipes = recipes

  if (searchParams?.search) {
    const search = searchParams.search.toLowerCase()
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(search) ||
        recipe.description.toLowerCase().includes(search) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(search)),
    )
  }

  if (searchParams?.difficulty) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) => recipe.difficulty.toLowerCase() === searchParams.difficulty?.toLowerCase(),
    )
  }

  if (searchParams?.time) {
    const maxTime = Number.parseInt(searchParams.time)
    filteredRecipes = filteredRecipes.filter((recipe) => {
      const recipeTime = Number.parseInt(recipe.time)
      return recipeTime <= maxTime
    })
  }

  if (searchParams?.category) {
    const category = searchParams.category.toLowerCase()
    filteredRecipes = filteredRecipes.filter((recipe) => {
      if (category === "breakfast") return recipe.id.includes("pancake") || recipe.id.includes("banana-bread")
      if (category === "dinner")
        return recipe.id.includes("shrimp") || recipe.id.includes("chicken") || recipe.id.includes("stir-fry")
      if (category === "dessert") return recipe.id.includes("cookie") || recipe.id.includes("bread")
      return true
    })
  }

  return (
    <section>
      <RecipeFilters />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {searchParams?.search ? `Search Results (${filteredRecipes.length})` : "Popular Recipes"}
        </h2>
      </div>

      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} userId={user?.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-2">No recipes found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </section>
  )
}
