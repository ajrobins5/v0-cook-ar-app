import { recipes } from "@/lib/recipe-data"
import { Header } from "@/components/header"
import { RecipeDetail } from "@/components/recipe-detail"
import { RecipeReviews } from "@/components/recipe-reviews"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface RecipePageProps {
  params: Promise<{ id: string }>
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params
  const recipe = recipes.find((r) => r.id === id)

  if (!recipe) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch reviews with profile information
  const { data: reviews } = await supabase
    .from("recipe_reviews")
    .select(
      `
      id,
      user_id,
      rating,
      comment,
      photo_url,
      created_at,
      profiles:user_id (
        display_name
      )
    `,
    )
    .eq("recipe_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen">
      <Header />
      <RecipeDetail recipe={recipe} userId={user?.id} />
      <div className="container mx-auto px-4 pb-8">
        <RecipeReviews recipeId={recipe.id} userId={user?.id} reviews={reviews || []} />
      </div>
    </div>
  )
}
